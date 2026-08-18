import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Razorpay checkout. Works in two modes:
 *  - live/test: RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET secrets are configured
 *  - demo: no keys yet — the UI simulates a successful payment so the buying
 *    flow can be tested end to end before credentials arrive.
 */

export const getRazorpayConfig = createServerFn({ method: "GET" }).handler(async () => {
  const keyId = process.env["RAZORPAY_KEY_ID"] ?? "";
  return { enabled: Boolean(keyId && process.env["RAZORPAY_KEY_SECRET"]), keyId };
});

export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        amount: z.number().int().min(100).max(50_000_000),
        receipt: z.string().trim().max(40).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const keyId = process.env["RAZORPAY_KEY_ID"];
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    if (!keyId || !keySecret) {
      return { mode: "demo" as const, orderId: `demo_${Date.now()}`, keyId: "", amount: data.amount };
    }

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${btoa(`${keyId}:${keySecret}`)}`,
      },
      body: JSON.stringify({
        amount: data.amount,
        currency: "INR",
        receipt: data.receipt ?? `rcpt_${Date.now()}`,
      }),
    });
    if (!res.ok) throw new Error(`Razorpay order failed (${res.status})`);
    const json = (await res.json()) as { id: string };
    return { mode: "live" as const, orderId: json.id, keyId, amount: data.amount };
  });

async function hmacSha256Hex(secret: string, message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        orderCode: z.string().trim().min(4).max(32),
        razorpayOrderId: z.string().trim().max(80),
        razorpayPaymentId: z.string().trim().max(80),
        razorpaySignature: z.string().trim().max(200).optional().or(z.literal("")),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const keySecret = process.env["RAZORPAY_KEY_SECRET"];
    const demo = data.razorpayOrderId.startsWith("demo_");

    if (!demo) {
      if (!keySecret) throw new Error("Payments are not configured");
      const expected = await hmacSha256Hex(
        keySecret,
        `${data.razorpayOrderId}|${data.razorpayPaymentId}`,
      );
      if (expected !== data.razorpaySignature) throw new Error("Payment signature mismatch");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: demo ? "demo_paid" : "paid",
        razorpay_order_id: data.razorpayOrderId,
        razorpay_payment_id: data.razorpayPaymentId,
      })
      .eq("order_code", data.orderCode.toUpperCase());
    if (error) throw new Error(error.message);

    return { ok: true, demo };
  });