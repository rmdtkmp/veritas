import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Upload, Link2, FileText, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  runGuestFactCheck,
  runUserFactCheck,
  type FactCheckResult,
} from "@/lib/factcheck.functions";
import { LoadingSteps } from "@/components/loading-steps";
import { VerdictCard } from "@/components/verdict-card";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/cek")({
  head: () => ({
    meta: [
      { title: "Cek Fakta — VERITAS AI" },
      {
        name: "description",
        content:
          "Tempel teks, URL, atau unggah tangkapan layar untuk diperiksa oleh AI. Verdict, skor kepercayaan, dan sumber rujukan.",
      },
    ],
  }),
  component: CekPage,
});

const CATEGORIES = [
  "Politik",
  "Kesehatan",
  "Sains & Teknologi",
  "Ekonomi",
  "Bencana / Keamanan",
  "Sosial & Budaya",
  "Pendidikan",
  "Selebriti / Hiburan",
  "Lainnya",
];

const GUEST_LIMIT = 3;

function todayKey() {
  return "veritas-guest-" + new Date().toISOString().slice(0, 10);
}

function CekPage() {
  const { user } = useAuth();
  const guestFn = useServerFn(runGuestFactCheck);
  const userFn = useServerFn(runUserFactCheck);

  const [tab, setTab] = useState<"text" | "url" | "image">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);

  const onFile = (f: File | null) => {
    if (!f) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
      toast.error("Format gambar harus JPG, PNG, atau WEBP.");
      return;
    }
    if (f.size > 6 * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 6 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(String(reader.result));
      setImageName(f.name);
    };
    reader.readAsDataURL(f);
  };

  const submit = async () => {
    let payload: {
      inputType: "text" | "url" | "image";
      content: string;
      category?: string;
      imageDataUrl?: string;
    };

    if (tab === "text") {
      if (text.trim().length < 8) return toast.error("Masukkan teks minimal 8 karakter.");
      payload = { inputType: "text", content: text.trim(), category };
    } else if (tab === "url") {
      try {
        new URL(url);
      } catch {
        return toast.error("URL tidak valid.");
      }
      payload = { inputType: "url", content: url.trim(), category };
    } else {
      if (!imageData) return toast.error("Unggah gambar terlebih dahulu.");
      payload = {
        inputType: "image",
        content: text.trim() || "(tanpa konteks tambahan)",
        category,
        imageDataUrl: imageData,
      };
    }

    if (!user) {
      const key = todayKey();
      const used = Number(localStorage.getItem(key) ?? "0");
      if (used >= GUEST_LIMIT) {
        toast.error(
          "Batas 3 pemeriksaan/hari untuk tamu tercapai. Silakan masuk untuk akses tak terbatas.",
        );
        return;
      }
      localStorage.setItem(key, String(used + 1));
    }

    setLoading(true);
    setResult(null);
    try {
      const r = user ? await userFn({ data: payload }) : await guestFn({ data: payload });
      setResult(r);
      toast.success("Pemeriksaan selesai");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Terjadi kesalahan saat memproses.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mx-auto mb-8 max-w-4xl">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Cek Fakta</h1>
        <p className="mt-2 text-muted-foreground">
          Tempel teks, URL artikel, atau unggah tangkapan layar. AI akan memeriksa dan memberikan
          verdict yang transparan.
        </p>
        {!user && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-info/30 bg-info/10 p-3 text-sm">
            <span>
              Anda sedang sebagai tamu — maksimal <strong>{GUEST_LIMIT}</strong> pemeriksaan/hari.
            </span>
            <Button asChild size="sm" variant="outline">
              <Link to="/auth">Masuk untuk akses tak terbatas</Link>
            </Button>
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* LEFT — Input */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="text">
                <FileText className="mr-1.5 h-4 w-4" />
                Teks
              </TabsTrigger>
              <TabsTrigger value="url">
                <Link2 className="mr-1.5 h-4 w-4" />
                URL
              </TabsTrigger>
              <TabsTrigger value="image">
                <Upload className="mr-1.5 h-4 w-4" />
                Gambar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="text" className="mt-4 space-y-3">
              <Label htmlFor="text-input">Teks berita / klaim</Label>
              <Textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tempel kutipan berita, pesan WhatsApp, caption media sosial, dll."
                rows={9}
                maxLength={8000}
                className="resize-y"
              />
              <div className="text-right text-xs text-muted-foreground">{text.length}/8000</div>
            </TabsContent>

            <TabsContent value="url" className="mt-4 space-y-3">
              <Label htmlFor="url-input">URL artikel</Label>
              <Input
                id="url-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://contoh.com/berita-yang-ingin-diperiksa"
              />
              <p className="text-xs text-muted-foreground">
                Kami akan mengambil isi halaman publik (jika dapat diakses) dan menganalisisnya.
              </p>
            </TabsContent>

            <TabsContent value="image" className="mt-4 space-y-3">
              <Label>Tangkapan layar (JPG, PNG, WEBP — maks. 6MB)</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center text-sm transition-colors hover:bg-muted/50">
                {imageData ? (
                  <div className="relative w-full">
                    <img src={imageData} alt="preview" className="mx-auto max-h-64 rounded-lg" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setImageData(null);
                        setImageName(null);
                      }}
                      className="absolute right-1 top-1 rounded-full bg-background/80 p-1.5 hover:bg-background"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <p className="mt-2 text-xs text-muted-foreground">{imageName}</p>
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="font-medium">Klik untuk pilih gambar</span>
                    <span className="text-xs text-muted-foreground">atau seret ke sini</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Konteks tambahan (opsional): apa yang ingin diperiksa dari gambar ini?"
                rows={3}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-5 space-y-2">
            <Label>Kategori (opsional)</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori..." />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={submit}
            disabled={loading}
            size="lg"
            className="mt-6 w-full shadow-elevated"
          >
            <ShieldCheck className="mr-2 h-4 w-4" />
            {loading ? "Memeriksa..." : "Cek Berita Sekarang"}
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Hasil ini merupakan analisis AI dan bukan keputusan hukum atau pendapat profesional.
          </p>
        </div>

        {/* RIGHT — Output */}
        <div className="space-y-4">
          {loading && <LoadingSteps />}
          {!loading && result && <VerdictCard result={result} />}
          {!loading && !result && (
            <div className="grid h-full min-h-[400px] place-items-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
              <div>
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">Hasil akan muncul di sini</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  Mulai dengan menempel konten di sebelah kiri, lalu klik{" "}
                  <strong>Cek Berita Sekarang</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
