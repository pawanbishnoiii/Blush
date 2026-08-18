import { createFileRoute } from "@tanstack/react-router";

/**
 * Shiprocket status webhook.
 * Configure in Shiprocket → Settings → API → Webhooks:
 *   URL:   https://<your-domain>/api/public/webhooks/shiprocket
 *   Token: the same value saved on the Shiprocket provider in Admin → Delivery
 * Shiprocket sends the token back in the `x-api-key` header.
 */

const STATUS_MAP: Record<string, string> = {
  "awb assigned": "processing",
  "pickup scheduled": "processing",
  "pickup generated": "processing",
  "pickup queued": "processing",
  "picked up": "shipped",
  shipped: "shipped",
  "in transit": "in_transit",
  "out for delivery": "out_for_delivery",
  delivered: "delivered",
  cancelled: "cancelled",
  rto: "returned",
  "rto delivered": "returned",
  "rto initiated": "returned",
  undelivered: "in_transit",
};

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export const Route = createFileRoute("/api/public/webhooks/shiprocket")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: provider } = await supabaseAdmin
          .from("delivery_providers")
          .select("webhook_token")
          .eq("code", "shiprocket")
          .maybeSingle();

        const expected = (provider as { webhook_token?: string | null } | null)?.webhook_token ?? "";
        const supplied = request.headers.get("x-api-key") ?? "";
        if (!expected || !timingSafeEqual(expected, supplied)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let payload: Record<string, unknown>;
        try {
          payload = (await request.json()) as Record<string, unknown>;
        } catch {
          return new Response("Bad request", { status: 400 });
        }

        const orderCode = String(payload["order_id"] ?? payload["channel_order_id"] ?? "").trim();
        const awb = String(payload["awb"] ?? payload["awb_code"] ?? "").trim();
        const raw = String(payload["current_status"] ?? payload["shipment_status"] ?? "")
          .trim()
          .toLowerCase();
        if (!orderCode) return new Response("Missing order id", { status: 400 });

        const status = STATUS_MAP[raw];
        const { data: order } = await supabaseAdmin
          .from("orders")
          .select("id")
          .eq("order_code", orderCode.toUpperCase())
          .maybeSingle();
        if (!order) return new Response("Unknown order", { status: 404 });

        const update: { courier: string; status?: string; tracking_number?: string } = {
          courier: "Shiprocket",
        };
        if (status) update.status = status;
        if (awb) update.tracking_number = awb;
        await supabaseAdmin.from("orders").update(update).eq("id", order.id);

        await supabaseAdmin.from("tracking_events").insert({
          order_id: order.id,
          status: status ?? "update",
          title: raw ? raw.replace(/\b\w/g, (c) => c.toUpperCase()) : "Shipment update",
          note: awb ? `Shiprocket AWB ${awb}` : "Status updated by Shiprocket",
        });

        return Response.json({ ok: true });
      },
    },
  },
});