import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">Halaman yang Anda cari tidak tersedia.</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Halaman gagal dimuat</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Coba lagi
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            Beranda
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VERITAS AI | DFK Versi 1.0 — Asisten Cek Fakta Berbasis AI" },
      {
        name: "description",
        content:
          "Verifikasi berita, foto, dan teks dari media daring secara otomatis dengan AI. Deteksi disinformasi, fitnah, dan ujaran kebencian.",
      },
      { property: "og:title", content: "VERITAS AI | DFK Versi 1.0 — Asisten Cek Fakta Berbasis AI" },
      {
        property: "og:description",
        content: "Asisten AI untuk memeriksa fakta berita, foto, dan teks berbahasa Indonesia.",
      },
      { property: "og:type", content: "website" },
      { name: "theme-color", content: "#2b6cf6" },
      { name: "twitter:title", content: "VERITAS AI | DFK Versi 1.0 — Asisten Cek Fakta Berbasis AI" },
      { name: "description", content: "Aplikasi asisten AI untuk memverifikasi konten disinformasi, fitnah, dan kebencian. Cocok untuk murid, guru, dan kita semua." },
      { property: "og:description", content: "Aplikasi asisten AI untuk memverifikasi konten disinformasi, fitnah, dan kebencian. Cocok untuk murid, guru, dan kita semua." },
      { name: "twitter:description", content: "Aplikasi asisten AI untuk memverifikasi konten disinformasi, fitnah, dan kebencian. Cocok untuk murid, guru, dan kita semua." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/7rAj9s8MzDbxZbPHSBw7aRGCfD43/social-images/social-1779253852638-Puspa_komdigi-jukebox-bg-removed.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/7rAj9s8MzDbxZbPHSBw7aRGCfD43/social-images/social-1779253852638-Puspa_komdigi-jukebox-bg-removed.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-background">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
