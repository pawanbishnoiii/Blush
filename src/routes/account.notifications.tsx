import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { myNotificationsQuery } from "@/lib/queries";
import { Icon3D } from "@/components/site/Icon3D";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/account/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Blush" },
      { name: "description", content: "Order updates, offers and alerts from Blush." },
      { property: "og:title", content: "Notifications — Blush" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const notifications = useQuery({ ...myNotificationsQuery, enabled: Boolean(user) });

  if (loading) return <div className="px-5 py-20 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-24 text-center">
        <p className="text-sm text-muted-foreground">Sign in to see your notifications.</p>
        <Link to="/auth" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground">
          Sign in
        </Link>
      </div>
    );
  }

  const list = notifications.data ?? [];
  const unread = list.filter((n) => !n.is_read);

  async function markRead(id: string) {
    const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["my_notifications"] });
  }

  async function markAllRead() {
    if (unread.length === 0) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user!.id)
      .eq("is_read", false);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["my_notifications"] });
    toast.success("All caught up");
  }

  return (
    <div className="mx-auto w-full max-w-[800px] px-5 pb-24 pt-8 sm:px-8">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Icon3D name="notifications" size="xl" float />
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground">{unread.length} unread</p>
          </div>
        </div>
        {unread.length > 0 && (
          <button type="button" onClick={markAllRead} className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold shadow-soft">
            Mark all read
          </button>
        )}
      </div>

      <div className="mt-8 space-y-2">
        {list.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => !n.is_read && markRead(n.id)}
            className={cn(
              "flex w-full items-start gap-3 rounded-2xl p-4 text-left shadow-soft",
              n.is_read ? "bg-surface" : "border border-primary/30 bg-card",
            )}
          >
            <Icon3D name="notifications" size="sm" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{n.title}</p>
                {!n.is_read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
              </div>
              {n.body && <p className="text-xs text-muted-foreground">{n.body}</p>}
            </div>
          </button>
        ))}
        {list.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
      </div>
    </div>
  );
}
