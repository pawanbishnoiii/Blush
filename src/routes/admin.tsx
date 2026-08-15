import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Icon3D } from "@/components/site/Icon3D";
import { useAuth } from "@/hooks/useAuth";
import type { Icon3DName } from "@/lib/icons3d";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin control center — Blush" },
      { name: "description", content: "Manage products, orders, banners, shipping and reviews." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin control center — Blush" },
      { property: "og:description", content: "Internal store management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: Icon3DName }[] = [
  { to: "/admin", label: "Dashboard", icon: "store" },
  { to: "/admin/products", label: "Products", icon: "women-fashion" },
  { to: "/admin/categories", label: "Categories", icon: "collections" },
  { to: "/admin/brands", label: "Brands", icon: "best-sellers" },
  { to: "/admin/orders", label: "Orders", icon: "my-orders" },
  { to: "/admin/banners", label: "Banners", icon: "offers" },
  { to: "/admin/delivery", label: "Delivery", icon: "fast-delivery" },
  { to: "/admin/reviews", label: "Reviews", icon: "camera-review" },
  { to: "/admin/customers", label: "Customers", icon: "profile" },
];

function AdminLayout() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  if (loading) {
    return <div className="px-5 py-24 text-center text-sm text-muted-foreground">Checking access…</div>;
  }

  if (user && !isAdmin) {
    return (
      <div className="flex flex-col items-center gap-3 px-5 py-24 text-center">
        <Icon3D name="safety-security" size="2xl" />
        <p className="font-display text-xl font-bold">Admins only</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This area is restricted. Ask an owner to grant your account the admin role.
        </p>
        <Link to="/" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          Back to shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-6 sm:px-8 md:pb-12">
      <div className="flex items-center gap-3">
        <Icon3D name="brand-store" size="lg" float />
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Control center</h1>
          <p className="text-xs text-muted-foreground">Everything you need to run the store</p>
        </div>
      </div>

      <nav className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
        {NAV.map((n) => {
          const active = n.to === "/admin" ? pathname === "/admin" : pathname.startsWith(n.to);
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-all",
                active ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card",
              )}
            >
              <Icon3D name={n.icon} size="xs" className="h-5 w-5" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-7">
        <Outlet />
      </div>
    </div>
  );
}
