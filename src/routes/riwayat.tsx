import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, History as HistoryIcon, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VerdictCard } from "@/components/verdict-card";
import type { FactCheckResult } from "@/lib/factcheck.functions";

export const Route = createFileRoute("/riwayat")({
  head: () => ({
    meta: [
      { title: "Riwayat — VERITAS AI" },
      { name: "description", content: "Riwayat pemeriksaan fakta Anda di VERITAS AI." },
    ],
  }),
  component: RiwayatPage,
});

type Row = {
  id: string;
  created_at: string;
  input_type: string;
  input_content: string;
  category: string | null;
  verdict: FactCheckResult["verdict"];
  confidence: number;
  summary: string | null;
  category_detected: string | null;
  reasoning: unknown;
  sources: unknown;
  literacy_tips: unknown;
};

const VERDICT_TONE: Record<string, string> = {
  BENAR: "bg-success/15 text-success border-success/30",
  MENYESATKAN: "bg-warning/15 text-warning-foreground border-warning/40",
  HOAKS: "bg-destructive/15 text-destructive border-destructive/30",
  FITNAH: "bg-destructive/15 text-destructive border-destructive/30",
  "UJARAN KEBENCIAN": "bg-destructive/15 text-destructive border-destructive/30",
  "TIDAK TERVERIFIKASI": "bg-muted text-muted-foreground border-border",
};

function RiwayatPage() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [verdictFilter, setVerdictFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Row | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("fact_checks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (error) console.error(error);
        setRows((data ?? []) as Row[]);
        setLoading(false);
      });
  }, [user]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (verdictFilter !== "all" && r.verdict !== verdictFilter) return false;
      if (q && !(`${r.input_content} ${r.summary ?? ""}`.toLowerCase().includes(q.toLowerCase()))) return false;
      return true;
    });
  }, [rows, q, verdictFilter]);

  if (authLoading)
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Memuat...</div>;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-soft">
          <HistoryIcon className="mx-auto h-10 w-10 text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Masuk untuk melihat riwayat</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Daftar atau masuk untuk menyimpan dan mencari kembali pemeriksaan Anda kapan saja.
          </p>
          <Button asChild className="mt-5">
            <Link to="/auth">Masuk / Daftar</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Riwayat Pemeriksaan</h1>
      <p className="mt-2 text-muted-foreground">{rows.length} pemeriksaan tersimpan</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari isi atau ringkasan..."
            className="pl-9"
          />
        </div>
        <Select value={verdictFilter} onValueChange={setVerdictFilter}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua verdict</SelectItem>
            <SelectItem value="BENAR">BENAR</SelectItem>
            <SelectItem value="MENYESATKAN">MENYESATKAN</SelectItem>
            <SelectItem value="HOAKS">HOAKS</SelectItem>
            <SelectItem value="FITNAH">FITNAH</SelectItem>
            <SelectItem value="UJARAN KEBENCIAN">UJARAN KEBENCIAN</SelectItem>
            <SelectItem value="TIDAK TERVERIFIKASI">TIDAK TERVERIFIKASI</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-3">
          {loading ? (
            <p className="text-sm text-muted-foreground">Memuat...</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground">
              Belum ada hasil yang cocok.
            </div>
          ) : (
            filtered.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelected(r)}
                className={`w-full rounded-xl border bg-card p-4 text-left shadow-soft transition-colors hover:bg-accent/50 ${
                  selected?.id === r.id ? "border-primary" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className={VERDICT_TONE[r.verdict]}>
                        {r.verdict}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{r.confidence}%</span>
                      <span className="text-xs text-muted-foreground">
                        · {new Date(r.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm">{r.summary || r.input_content}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </button>
            ))
          )}
        </div>

        <div>
          {selected ? (
            <VerdictCard
              result={{
                verdict: selected.verdict,
                confidence: selected.confidence,
                summary: selected.summary ?? "",
                category_detected: selected.category_detected ?? "lainnya",
                reasoning: (selected.reasoning as FactCheckResult["reasoning"]) ?? [],
                sources: (selected.sources as FactCheckResult["sources"]) ?? [],
                literacy_tips: (selected.literacy_tips as string[]) ?? [],
              }}
            />
          ) : (
            <div className="grid h-full min-h-[300px] place-items-center rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center text-sm text-muted-foreground">
              Pilih salah satu pemeriksaan untuk melihat detail.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
