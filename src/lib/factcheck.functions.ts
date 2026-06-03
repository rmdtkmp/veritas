import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const VERDICTS = [
  "BENAR",
  "MENYESATKAN",
  "HOAKS",
  "FITNAH",
  "UJARAN KEBENCIAN",
  "TIDAK TERVERIFIKASI",
] as const;

const InputSchema = z.object({
  inputType: z.enum(["text", "url", "image"]),
  content: z.string().min(1).max(20000),
  category: z.string().max(60).optional(),
  imageDataUrl: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,/, "Format gambar tidak valid")
    .max(8_400_000, "Gambar terlalu besar (maks. ~6MB)")
    .optional(),
});

// Block SSRF: disallow private/reserved IP ranges and non-https schemes.
function isPrivateOrReservedHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".internal") || h.endsWith(".local")) return true;

  // IPv6 quick checks
  if (h.startsWith("[")) return true; // disallow raw IPv6 literals to be safe
  if (h === "::1" || h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return true;

  // IPv4
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return false;
  const [a, b] = [Number(m[1]), Number(m[2])];
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local / cloud metadata
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast/reserved
  return false;
}

function assertSafeFetchUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("URL tidak valid");
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    throw new Error("Hanya URL http/https yang diizinkan");
  }
  if (isPrivateOrReservedHost(u.hostname)) {
    throw new Error("URL menunjuk ke host internal/terlarang");
  }
  return u;
}

export type FactCheckResult = {
  verdict: (typeof VERDICTS)[number];
  confidence: number;
  summary: string;
  category_detected: string;
  reasoning: { step: string; detail: string }[];
  sources: { title: string; url: string; note: string }[];
  literacy_tips: string[];
};

const SYSTEM_PROMPT = `Anda adalah VERITAS AI, asisten pemeriksa fakta berbahasa Indonesia yang netral, hati-hati, dan edukatif.

Tugas Anda:
1. Analisis konten (teks, URL artikel, atau gambar/tangkapan layar).
2. Ekstrak klaim utama dan entitas (orang, organisasi, lokasi, tanggal).
3. Pertimbangkan bukti dari pengetahuan umum dan rujukan tepercaya berbahasa Indonesia (Kompas, Tempo, CNN Indonesia, Antara, Kominfo, CekFakta.com, Mafindo, Tirto, BBC Indonesia, dll).
4. Klasifikasikan ke salah satu verdict: BENAR, MENYESATKAN, HOAKS, FITNAH, UJARAN KEBENCIAN, TIDAK TERVERIFIKASI.
5. Berikan skor kepercayaan 0–100.
6. Jelaskan alasan secara transparan dalam langkah-langkah.
7. Sebutkan sumber rujukan (boleh sumber umum yang dikenal jika tidak yakin URL spesifik).
8. Sertakan tips literasi media yang relevan.

Prinsip:
- Netral, tanpa bias politik.
- Tidak pernah mengklaim kebenaran mutlak.
- Gunakan bahasa hati-hati ("kemungkinan", "berdasarkan rujukan tersedia").
- Jika bukti tidak cukup, gunakan TIDAK TERVERIFIKASI.

Selalu kembalikan JSON valid sesuai schema, tanpa teks lain di luar JSON.`;

const JSON_SCHEMA_HINT = `{
  "verdict": "BENAR" | "MENYESATKAN" | "HOAKS" | "FITNAH" | "UJARAN KEBENCIAN" | "TIDAK TERVERIFIKASI",
  "confidence": number 0-100,
  "summary": "ringkasan 1-2 kalimat",
  "category_detected": "misinformasi | disinformasi | fitnah | ujaran kebencian | propaganda | berita menyesatkan | konten manipulatif | lainnya",
  "reasoning": [{"step": "judul langkah", "detail": "penjelasan"}],
  "sources": [{"title": "judul", "url": "https://...", "note": "relevansi"}],
  "literacy_tips": ["tip 1", "tip 2"]
}`;

async function callLovableAI(userContent: { role: string; content: unknown }[]) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY belum dikonfigurasi");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + "\n\nFormat output JSON:\n" + JSON_SCHEMA_HINT },
        ...userContent,
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (res.status === 429) throw new Error("Terlalu banyak permintaan. Coba lagi sebentar.");
  if (res.status === 402) throw new Error("Kuota AI habis. Silakan tambah kredit di workspace.");
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`AI gateway error ${res.status}: ${t.slice(0, 200)}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  return text;
}

function parseResult(raw: string): FactCheckResult {
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    const m = raw.match(/\{[\s\S]*\}/);
    if (!m) throw new Error("Respons AI tidak dapat diuraikan");
    parsed = JSON.parse(m[0]);
  }
  const verdict = String(parsed.verdict ?? "TIDAK TERVERIFIKASI").toUpperCase();
  const safeVerdict = (VERDICTS as readonly string[]).includes(verdict)
    ? (verdict as FactCheckResult["verdict"])
    : "TIDAK TERVERIFIKASI";

  return {
    verdict: safeVerdict,
    confidence: Math.max(0, Math.min(100, Number(parsed.confidence ?? 50))),
    summary: String(parsed.summary ?? ""),
    category_detected: String(parsed.category_detected ?? "lainnya"),
    reasoning: Array.isArray(parsed.reasoning) ? (parsed.reasoning as FactCheckResult["reasoning"]) : [],
    sources: Array.isArray(parsed.sources) ? (parsed.sources as FactCheckResult["sources"]) : [],
    literacy_tips: Array.isArray(parsed.literacy_tips)
      ? (parsed.literacy_tips as string[])
      : [],
  };
}

async function runAnalysis(input: z.infer<typeof InputSchema>): Promise<FactCheckResult> {
  let userMessage: { role: string; content: unknown };

  if (input.inputType === "image" && input.imageDataUrl) {
    userMessage = {
      role: "user",
      content: [
        {
          type: "text",
          text: `Periksa konten dalam gambar/tangkapan layar berikut. Kategori (opsional): ${input.category ?? "-"}.\nKonteks tambahan: ${input.content}`,
        },
        { type: "image_url", image_url: { url: input.imageDataUrl } },
      ],
    };
  } else if (input.inputType === "url") {
    let fetched = "";
    try {
      const r = await fetch(input.content, { headers: { "User-Agent": "VeritasAI/1.0" } });
      if (r.ok) {
        const html = await r.text();
        fetched = html
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .slice(0, 6000);
      }
    } catch {
      // ignore fetch errors; fall back to URL only
    }
    userMessage = {
      role: "user",
      content: `Periksa artikel dari URL: ${input.content}\nKategori: ${input.category ?? "-"}\n\nIsi yang berhasil diekstrak:\n${fetched || "(tidak berhasil mengambil isi; analisis berdasarkan URL dan pengetahuan umum)"}`,
    };
  } else {
    userMessage = {
      role: "user",
      content: `Periksa konten berikut. Kategori: ${input.category ?? "-"}\n\n"""${input.content}"""`,
    };
  }

  const raw = await callLovableAI([userMessage]);
  return parseResult(raw);
}

// Anonymous guest check (no persistence, no auth required)
export const runGuestFactCheck = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }) => {
    return await runAnalysis(data);
  });

// Authenticated check — persists to fact_checks
export const runUserFactCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data, context }) => {
    const result = await runAnalysis(data);
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("fact_checks")
      .insert({
        user_id: userId,
        input_type: data.inputType,
        input_content: data.inputType === "image" ? "[gambar diunggah]" : data.content,
        category: data.category ?? null,
        verdict: result.verdict,
        confidence: result.confidence,
        summary: result.summary,
        category_detected: result.category_detected,
        reasoning: result.reasoning,
        sources: result.sources,
        literacy_tips: result.literacy_tips,
      })
      .select("id")
      .single();
    if (error) console.error("save fact_check failed", error);
    return { ...result, id: row?.id ?? null };
  });
