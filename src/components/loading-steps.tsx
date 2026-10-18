import { useEffect, useState } from "react";
import { Loader2, Search, Brain, FileText, BookOpen } from "lucide-react";

const STEPS = [
  { icon: FileText, label: "Membaca konten..." },
  { icon: Search, label: "Mencari referensi..." },
  { icon: Brain, label: "Menganalisis dengan AI..." },
  { icon: BookOpen, label: "Menyusun hasil..." },
];

export function LoadingSteps() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => Math.min(a + 1, STEPS.length - 1)), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="mb-5 flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <h3 className="text-sm font-semibold">Sedang memeriksa fakta</h3>
      </div>
      <ol className="space-y-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const done = i < active;
          const current = i === active;
          return (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg border transition-all ${
                  done
                    ? "border-success/40 bg-success/10 text-success"
                    : current
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-muted text-muted-foreground"
                }`}
              >
                <Icon className={`h-4 w-4 ${current ? "animate-pulse" : ""}`} />
              </span>
              <span className={done || current ? "text-foreground" : "text-muted-foreground"}>
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
