import { DISCLAIMER } from "@/lib/disclaimer";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scale,
  Flame,
  HelpCircle,
  Share2,
} from "lucide-react";
import type { FactCheckResult } from "@/lib/factcheck.functions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const VERDICT_META: Record<
  FactCheckResult["verdict"],
  { label: string; tone: string; icon: React.ComponentType<{ className?: string }>; desc: string }
> = {
  BENAR: {
    label: "BENAR",
    tone: "bg-success/15 text-success border-success/30",
    icon: CheckCircle2,
    desc: "Klaim didukung bukti yang memadai.",
  },
  MENYESATKAN: {
    label: "MENYESATKAN",
    tone: "bg-warning/15 text-warning-foreground border-warning/40",
    icon: AlertTriangle,
    desc: "Ada unsur fakta, tetapi disajikan menyesatkan.",
  },
  HOAKS: {
    label: "HOAKS",
    tone: "bg-destructive/15 text-destructive border-destructive/30",
    icon: XCircle,
    desc: "Klaim palsu atau dibuat-buat.",
  },
  FITNAH: {
    label: "FITNAH",
    tone: "bg-destructive/15 text-destructive border-destructive/30",
    icon: Scale,
    desc: "Tuduhan tanpa bukti yang merugikan pihak tertentu.",
  },
  "UJARAN KEBENCIAN": {
    label: "UJARAN KEBENCIAN",
    tone: "bg-destructive/15 text-destructive border-destructive/30",
    icon: Flame,
    desc: "Mengandung kebencian terhadap kelompok tertentu.",
  },
  "TIDAK TERVERIFIKASI": {
    label: "TIDAK TERVERIFIKASI",
    tone: "bg-muted text-muted-foreground border-border",
    icon: HelpCircle,
    desc: "Bukti belum cukup untuk menarik kesimpulan.",
  },
};

export function VerdictCard({ result }: { result: FactCheckResult }) {
  const meta = VERDICT_META[result.verdict];
  const Icon = meta.icon;

  const share = async () => {
    const text = `VERITAS AI — Verdict: ${result.verdict} (${result.confidence}%)\n${result.summary}`;
    try {
      if (navigator.share) await navigator.share({ title: "VERITAS AI", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Hasil disalin ke clipboard");
      }
    } catch {
      /* noop */
    }
  };

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl border p-6 shadow-soft ${meta.tone}`}>
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-background/60">
            <Icon className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                Verdict
              </span>
              <h3 className="text-2xl font-bold">{meta.label}</h3>
            </div>
            <p className="mt-1 text-sm opacity-80">{meta.desc}</p>
            <p className="mt-3 text-sm leading-relaxed text-foreground/90">{result.summary}</p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">Skor Kepercayaan AI</span>
            <span className="tabular-nums">{result.confidence}%</span>
          </div>
          <Progress value={result.confidence} className="h-2" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="bg-background/50">
            Kategori: {result.category_detected}
          </Badge>
          <Button size="sm" variant="outline" className="ml-auto bg-background/60" onClick={share}>
            <Share2 className="mr-1.5 h-3.5 w-3.5" /> Bagikan
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h4 className="mb-3 text-sm font-semibold">Langkah Penalaran AI</h4>
        <Accordion type="single" collapsible className="w-full">
          {result.reasoning.map((r, i) => (
            <AccordionItem key={i} value={`r-${i}`}>
              <AccordionTrigger className="text-sm">
                <span className="text-muted-foreground">{i + 1}.</span>&nbsp;{r.step}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {r.detail}
              </AccordionContent>
            </AccordionItem>
          ))}
          {result.reasoning.length === 0 && (
            <p className="text-sm text-muted-foreground">Tidak ada langkah penalaran tercatat.</p>
          )}
        </Accordion>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h4 className="mb-3 text-sm font-semibold">Sumber Rujukan</h4>
        {result.sources.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada sumber spesifik yang dapat dirujuk.
          </p>
        ) : (
          <ul className="space-y-3">
            {result.sources.map((s, i) => (
              <li
                key={i}
                className="flex flex-col gap-1 rounded-lg border border-border/60 bg-background/50 p-3"
              >
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {s.title || s.url}
                </a>
                {s.note && <span className="text-xs text-muted-foreground">{s.note}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-info/30 bg-info/10 p-6 shadow-soft">
        <h4 className="mb-3 text-sm font-semibold text-info-foreground">Tips Literasi Media</h4>
        <ul className="space-y-2">
          {result.literacy_tips.map((t, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-primary">•</span>
              <span>{t}</span>
            </li>
          ))}
          {result.literacy_tips.length === 0 && (
            <li className="text-sm text-muted-foreground">
              Selalu periksa sumber asli, tanggal, dan konteks lengkap sebelum membagikan.
            </li>
          )}
        </ul>
      </div>

      <p className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        {DISCLAIMER}
      </p>
    </div>
  );
}
