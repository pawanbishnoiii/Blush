import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BottomNav } from "@/components/site/BottomNav";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="eyebrow text-accent">404</p>
        <h1 className="section-type mt-3">This page has moved on.</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The link you followed doesn&apos;t exist any more. The collection is still here.
        </p>
        <Link
          to="/shop"
          className="mt-7 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          Browse the collection
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="section-type">Something didn&apos;t load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Give it another try — your cart is safe.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="rounded-full border border-border px-6 py-3 text-sm font-semibold">
            Go home
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
      { title: "Esko — Everyday essentials, built heavier" },
      {
        name: "description",
        content:
          "Esko makes a small line of heavyweight, honestly-made clothing for Indian weather. Free delivery over ₹1,499.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@400;600&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col overflow-x-hidden pb-20 md:pb-0">
        <a
          href="#main-content"
          className="skip-link rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-lift"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <BottomNav />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
