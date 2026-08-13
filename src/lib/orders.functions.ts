import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const itemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
});

export const placeOrderSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  addressLine1: z.string().trim().min(5).max(160),
  addressLine2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  paymentMethod: z.enum(["cod", "upi", "card"]),
  items: z.array(itemSchema).min(1).max(20),
  couponCode: z.string().trim().max(40).optional().or(z.literal("")),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

function makeOrderCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  for (const b of bytes) code += alphabet[b % alphabet.length];
  return `ESK-${code.slice(0, 4)}-${code.slice(4, 9)}`;
}

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => placeOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const variantIds = data.items.map((i) => i.variantId);
    const { data: variants, error: vErr } = await supabaseAdmin
      .from("product_variants")
      .select("id, product_id, color_name, size, stock, price_delta")
      .in("id", variantIds);
    if (vErr) throw new Error(vErr.message);

    // Some products are sold as single-SKU items with no product_variants row.
    // In that case the client sends the product id as the variant id (synthetic variant).
    const foundIds = new Set((variants ?? []).map((v) => v.id));
    const syntheticIds = variantIds.filter((id) => !foundIds.has(id));

    const { data: syntheticProducts, error: synErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price_inr, image_key")
      .in("id", syntheticIds);
    if (synErr) throw new Error(synErr.message);

    const productIds = [
      ...new Set([
        ...(variants ?? []).map((v) => v.product_id),
        ...(syntheticProducts ?? []).map((p) => p.id),
      ]),
    ];
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id, name, price_inr, image_key")
      .in("id", productIds);
    if (pErr) throw new Error(pErr.message);

    const { data: settings, error: sErr } = await supabaseAdmin
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .single();
    if (sErr) throw new Error(sErr.message);

    let couponRow: {
      id: string;
      kind: string;
      value: number;
      max_discount: number | null;
      min_cart: number;
      expires_at: string | null;
      is_active: boolean;
      used_count: number;
      usage_limit: number | null;
    } | null = null;
    if (data.couponCode) {
      const { data: coupon, error: cErr } = await supabaseAdmin
        .from("coupons")
        .select("id, kind, value, max_discount, min_cart, expires_at, is_active, used_count, usage_limit")
        .ilike("code", data.couponCode)
        .maybeSingle();
      if (cErr) throw new Error(cErr.message);
      if (!coupon) throw new Error("That coupon code isn't valid");
      couponRow = coupon;
    }

    let subtotal = 0;
    const lines = data.items.map((item) => {
      const variant = (variants ?? []).find((v) => v.id === item.variantId);
      const syntheticProduct = (syntheticProducts ?? []).find((p) => p.id === item.variantId);
      if (!variant && !syntheticProduct) throw new Error("Some items are no longer available");

      const product = (products ?? []).find((p) =>
        variant ? p.id === variant.product_id : p.id === syntheticProduct!.id,
      );
      if (!product) throw new Error("Product unavailable");

      if (variant) {
        if (variant.stock < item.quantity) {
          throw new Error(`${product.name} (${variant.color_name} / ${variant.size}) is out of stock`);
        }
      }

      const unitPrice = product.price_inr + (variant?.price_delta ?? 0);
      subtotal += unitPrice * item.quantity;
      return {
        product_id: product.id,
        variant_id: variant ? variant.id : product.id,
        name: product.name,
        variant_label: variant
          ? `${variant.color_name} · ${variant.size}`
          : "Default · One Size",
        image_key: product.image_key,
        unit_price: unitPrice,
        quantity: item.quantity,
        newStock: variant ? variant.stock - item.quantity : null,
        variantIdForUpdate: variant ? variant.id : null,
      };
    });

    let discount = 0;
    if (couponRow) {
      if (!couponRow.is_active) throw new Error("This coupon is no longer active");
      if (couponRow.expires_at && new Date(couponRow.expires_at).getTime() < Date.now()) {
        throw new Error("This coupon has expired");
      }
      if (subtotal < couponRow.min_cart) {
        throw new Error(`This coupon needs a minimum cart of ${couponRow.min_cart}`);
      }
      if (couponRow.usage_limit != null && couponRow.used_count >= couponRow.usage_limit) {
        throw new Error("This coupon has been fully redeemed");
      }
      const raw = couponRow.kind === "percent" ? Math.round((subtotal * couponRow.value) / 100) : couponRow.value;
      discount = Math.max(0, Math.min(couponRow.max_discount ? Math.min(raw, couponRow.max_discount) : raw, subtotal));
    }

    const shipping = subtotal >= settings.free_delivery_threshold ? 0 : settings.shipping_fee;
    const total = Math.max(0, subtotal - discount + shipping);

    const eta = new Date();
    eta.setDate(eta.getDate() + 4);

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_code: makeOrderCode(),
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        subtotal,
        shipping,
        total,
        payment_method: data.paymentMethod,
        status: "confirmed",
        courier: "Esko Express",
        tracking_number: `EX${Date.now().toString().slice(-10)}`,
        eta: eta.toISOString().slice(0, 10),
      })
      .select("id, order_code")
      .single();
    if (oErr || !order) throw new Error(oErr?.message ?? "Could not create order");

    const { error: iErr } = await supabaseAdmin.from("order_items").insert(
      lines.map((l) => ({
        order_id: order.id,
        product_id: l.product_id,
        variant_id: l.variant_id,
        name: l.name,
        variant_label: l.variant_label,
        image_key: l.image_key,
        unit_price: l.unit_price,
        quantity: l.quantity,
      })),
    );
    if (iErr) throw new Error(iErr.message);

    if (couponRow) {
      await supabaseAdmin
        .from("coupons")
        .update({ used_count: couponRow.used_count + 1 })
        .eq("id", couponRow.id);
    }

    await supabaseAdmin.from("tracking_events").insert([
      {
        order_id: order.id,
        status: "placed",
        title: "Order placed",
        note: `We received your order at ${new Date().toLocaleTimeString("en-IN")}.`,
      },
      {
        order_id: order.id,
        status: "confirmed",
        title: "Order confirmed",
        note:
          data.paymentMethod === "cod"
            ? "Cash on delivery confirmed. Your parcel is queued for packing."
            : "Payment confirmed. Your parcel is queued for packing.",
      },
    ]);

    await Promise.all(
      lines
        .filter((l) => l.newStock !== null && l.variant_id)
        .map((l) =>
          supabaseAdmin
            .from("product_variants")
            .update({ stock: l.newStock as number })
            .eq("id", l.variant_id as string),
        ),
    );

    return { orderCode: order.order_code, total, shipping, subtotal, discount };
  });

export const getOrder = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ code: z.string().trim().min(6).max(24) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_code, full_name, phone, address_line1, address_line2, city, state, pincode, subtotal, shipping, total, payment_method, status, courier, tracking_number, eta, created_at",
      )
      .eq("order_code", data.code.toUpperCase())
      .maybeSingle();

    if (!order) return null;

    const [{ data: items }, { data: events }] = await Promise.all([
      supabaseAdmin
        .from("order_items")
        .select("name, variant_label, image_key, unit_price, quantity")
        .eq("order_id", order.id),
      supabaseAdmin
        .from("tracking_events")
        .select("status, title, note, happened_at")
        .eq("order_id", order.id)
        .order("happened_at", { ascending: true }),
    ]);

    const { id: _id, ...safeOrder } = order;
    return { order: safeOrder, items: items ?? [], events: events ?? [] };
  });
