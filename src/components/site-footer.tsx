import { DISCLAIMER } from "@/lib/disclaimer";
export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 py-8 text-center text-xs text-muted-foreground">
        <p className="mx-auto max-w-3xl">{DISCLAIMER}</p>
        <p className="mt-3">© {new Date().getFullYear()} VERITAS AI · DFK Versi 1.0</p>
      </div>
    </footer>
  );
}
