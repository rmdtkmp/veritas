import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, BookOpen, Sparkles, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/panduan")({
  head: () => ({
    meta: [
      { title: "Panduan & Tentang — VERITAS AI" },
      {
        name: "description",
        content:
          "Pelajari cara kerja VERITAS AI, prinsip netralitas AI, dan tips literasi media untuk memerangi misinformasi.",
      },
    ],
  }),
  component: Panduan,
});

function Panduan() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Panduan & Tentang</h1>
        <p className="mt-3 text-muted-foreground">
          Mengenal VERITAS AI, cara kerjanya, dan bagaimana menggunakannya secara bertanggung jawab.
        </p>
      </div>

      <Section icon={Sparkles} title="Apa itu VERITAS AI?">
        VERITAS AI (DFK Versi 1.0) adalah asisten pemeriksa fakta berbahasa Indonesia berbasis AI.
        Dirancang untuk membantu pelajar, mahasiswa, guru, dosen, orang tua, dan masyarakat umum
        mengenali misinformasi, disinformasi, fitnah, ujaran kebencian, propaganda, berita
        menyesatkan, dan konten manipulatif di media sosial maupun media daring.
      </Section>

      <Section icon={ShieldCheck} title="Cara kerjanya">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Anda menempel teks, URL artikel, atau mengunggah tangkapan layar.</li>
          <li>AI mengekstraksi klaim utama dan entitas (orang, organisasi, tanggal).</li>
          <li>AI membandingkan klaim dengan pengetahuan umum dan rujukan tepercaya.</li>
          <li>AI mengklasifikasikan risiko misinformasi & memberi skor kepercayaan.</li>
          <li>Anda menerima verdict transparan beserta sumber dan tips literasi.</li>
        </ol>
      </Section>

      <Section icon={BookOpen} title="Jenis verdict">
        <ul className="grid gap-3 sm:grid-cols-2">
          <Verdict label="BENAR" desc="Klaim didukung bukti yang memadai." tone="success" />
          <Verdict
            label="MENYESATKAN"
            desc="Ada unsur fakta, tetapi disajikan menyesatkan."
            tone="warning"
          />
          <Verdict label="HOAKS" desc="Klaim palsu atau dibuat-buat." tone="destructive" />
          <Verdict label="FITNAH" desc="Tuduhan tanpa bukti yang merugikan." tone="destructive" />
          <Verdict
            label="UJARAN KEBENCIAN"
            desc="Mengandung kebencian terhadap kelompok tertentu."
            tone="destructive"
          />
          <Verdict
            label="TIDAK TERVERIFIKASI"
            desc="Bukti belum cukup untuk menarik kesimpulan."
            tone="muted"
          />
        </ul>
      </Section>

      <Section icon={ShieldCheck} title="Prinsip AI kami">
        <ul className="space-y-2">
          <li>• Netral dan tidak memihak secara politik.</li>
          <li>• Tidak pernah mengklaim kebenaran mutlak.</li>
          <li>• Menggunakan bahasa hati-hati ("kemungkinan", "berdasarkan rujukan tersedia").</li>
          <li>• Menjelaskan alasan secara transparan, bukan kotak hitam.</li>
          <li>• Jika bukti tidak cukup, akan ditandai sebagai TIDAK TERVERIFIKASI.</li>
        </ul>
      </Section>

      <Section icon={BookOpen} title="Tips literasi cepat">
        <ul className="space-y-2">
          <li>
            • Periksa <strong>sumber asli</strong> sebelum membagikan ulang.
          </li>
          <li>
            • Cek <strong>tanggal</strong> — berita lama sering didaur ulang sebagai baru.
          </li>
          <li>
            • Perhatikan <strong>konteks utuh</strong>, bukan hanya potongan kutipan.
          </li>
          <li>
            • Cari <strong>setidaknya dua rujukan</strong> independen.
          </li>
          <li>• Hati-hati pada konten yang memancing emosi kuat secara berlebihan.</li>
        </ul>
      </Section>

      <div className="mt-10 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-5 text-sm">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" />
        <p>
          <strong>Disclaimer:</strong> {DISCLAIMER}
        </p>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="text-sm leading-relaxed text-foreground/90">{children}</div>
    </section>
  );
}

function Verdict({ label, desc, tone }: { label: string; desc: string; tone: string }) {
  const tones: Record<string, string> = {
    success: "bg-success/15 text-success border-success/30",
    warning: "bg-warning/15 text-warning-foreground border-warning/40",
    destructive: "bg-destructive/15 text-destructive border-destructive/30",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <li className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="text-xs font-bold">{label}</div>
      <div className="mt-1 text-xs opacity-90">{desc}</div>
    </li>
  );
}
