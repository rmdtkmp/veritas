import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Sparkles,
  Search,
  Scale,
  Flame,
  ArrowRight,
  Eye,
  Brain,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VERITAS AI — Sabar sebelum sebar." },
      {
        name: "description",
        content:
          "Verifikasi berita, foto, dan teks dari media daring secara otomatis dengan AI. Aman digunakan oleh pelajar, mahasiswa, guru, dosen, dan masyarakat umum.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-primary-soft)_0%,transparent_70%)]"
        />
        <div className="container mx-auto px-4 pb-16 pt-16 md:pt-24 md:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-muted-foreground">
                Asisten AI cek fakta berbahasa Indonesia
              </span>
            </div>

            <h1 className="text-balance text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl">
              Sabar sebelum sebar.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted-foreground md:text-lg">
              Verifikasi berita, foto, dan teks dari media daring secara otomatis dengan AI.
              Cocok untuk pelajar, mahasiswa, guru, dosen, orang tua, dan masyarakat umum.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="h-12 px-6 text-base shadow-elevated">
                <Link to="/cek">
                  Mulai Cek Berita
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <Link to="/panduan">Pelajari Cara Kerjanya</Link>
              </Button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              Tanpa akun: 3 pemeriksaan/hari. Daftar gratis untuk akses tak terbatas dan riwayat tersimpan.
            </p>
          </div>

          {/* Quick preview card */}
          <div className="mx-auto mt-16 max-w-4xl rounded-3xl border border-border bg-card p-2 shadow-elevated">
            <div className="rounded-2xl bg-gradient-to-br from-primary-soft/60 via-background to-background p-8 md:p-10">
              <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
                <div>
                  <span className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    Contoh hasil
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">
                    "Pemerintah resmi melarang penggunaan smartphone di sekolah mulai 2026"
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    AI memeriksa narasumber, tanggal, dan rujukan resmi.
                  </p>
                </div>
                <div className="rounded-2xl border border-warning/40 bg-warning/10 p-5">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Verdict</span>
                  <h4 className="mt-1 text-2xl font-bold">MENYESATKAN</h4>
                  <p className="mt-2 text-sm text-foreground/80">
                    Wacana ada, namun tidak ada keputusan resmi seperti yang diklaim.
                  </p>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-background/60">
                    <div className="h-full w-[78%] rounded-full bg-warning" />
                  </div>
                  <div className="mt-1 text-right text-[10px] text-muted-foreground">78%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Apa yang bisa dideteksi?</h2>
          <p className="mt-3 text-muted-foreground">
            VERITAS AI dilatih untuk mengenali berbagai bentuk konten bermasalah yang umum beredar di Indonesia.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={Search}
            title="Deteksi Disinformasi"
            desc="Mengenali narasi palsu yang disebar dengan sengaja untuk menyesatkan pembaca."
          />
          <FeatureCard
            icon={Scale}
            title="Deteksi Fitnah"
            desc="Mengidentifikasi tuduhan tanpa bukti yang merugikan reputasi seseorang atau lembaga."
          />
          <FeatureCard
            icon={Flame}
            title="Deteksi Ujaran Kebencian"
            desc="Memberi peringatan pada konten yang merendahkan kelompok berdasarkan SARA atau identitas."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Cara kerjanya</h2>
            <p className="mt-3 text-muted-foreground">Tiga langkah sederhana, hasil yang transparan.</p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            <StepCard num="01" icon={Eye} title="Tempel konten" desc="Salin teks, URL artikel, atau unggah tangkapan layar." />
            <StepCard num="02" icon={Brain} title="AI menganalisis" desc="Ekstraksi klaim, perbandingan rujukan, klasifikasi risiko." />
            <StepCard num="03" icon={BookOpen} title="Hasil transparan" desc="Verdict, skor kepercayaan, sumber, dan tips literasi." />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-info p-10 text-center text-primary-foreground shadow-elevated md:p-14">
          <ShieldCheck className="mx-auto h-10 w-10 opacity-90" />
          <h2 className="mt-4 text-3xl font-bold md:text-4xl">Jangan ikut menyebar yang belum tentu benar.</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
            Cek dulu dengan VERITAS AI sebelum membagikan ke grup keluarga atau media sosial.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6 h-12 px-6 text-base">
            <Link to="/cek">Mulai Cek Sekarang</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function StepCard({
  num,
  icon: Icon,
  title,
  desc,
}: {
  num: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider text-muted-foreground">{num}</span>
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
