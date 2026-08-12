import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/policies")({
  head: () => ({
    meta: [
      { title: "Shipping, returns & privacy — Esko" },
      {
        name: "description",
        content:
          "Esko shipping timelines, 15-day return policy, exchange rules and how we handle your data.",
      },
      { property: "og:title", content: "Shipping, returns & privacy — Esko" },
      {
        property: "og:description",
        content: "Everything about Esko delivery, returns, exchanges and privacy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Policies,
});

const SECTIONS = [
  {
    id: "shipping",
    title: "Shipping",
    body: [
      "Orders placed before 4pm IST leave our Tiruppur facility the same working day. Metro cities usually receive parcels in 2–3 days; the rest of India in 4–6 days.",
      "Delivery is free on orders above ₹1,499. Below that a flat ₹79 applies, shown before you pay.",
      "Every parcel ships with Esko Express and a live tracking link, sent by email and SMS the moment the AWB is generated.",
    ],
  },
  {
    id: "returns",
    title: "Returns & exchanges",
    body: [
      "You have 15 days from delivery to return anything unworn, unwashed and with tags intact. Pickup is free and scheduled within 48 hours of your request.",
      "Refunds land back on the original payment method within 5 working days of the parcel reaching our warehouse. Cash-on-delivery refunds go to a bank account or UPI ID you share at pickup.",
      "Size exchanges are free once per order. Reply to your order email with the size you need and we ship the replacement as soon as the pickup is scanned.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    body: [
      "We collect only what a delivery needs: name, email, phone and address. If you use location detection at checkout, coordinates are used once to fill the address form and stored with your order for courier routing.",
      "We never sell customer data, and we do not run third-party advertising trackers on this site.",
      "Ask us to delete your data any time at care@esko.in — we remove everything not legally required for tax records.",
    ],
  },
  {
    id: "terms",
    title: "Terms",
    body: [
      "Prices are in Indian Rupees and include all applicable taxes. Offers cannot be combined unless stated.",
      "Fabric weights and measurements are given with a small tolerance because everything is cut and sewn by hand.",
      "By placing an order you confirm the delivery details you entered are accurate and reachable.",
    ],
  },
];

function Policies() {
  return (
    <div className="surface-warm">
      <div className="mx-auto w-full max-w-[880px] px-5 py-14 sm:px-8 lg:py-20">
        <p className="eyebrow text-accent">The fine print</p>
        <h1 className="section-type mt-4">Written plainly, because it matters.</h1>

        <nav className="mt-8 flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:border-foreground/30"
            >
              {s.title}
            </a>
          ))}
        </nav>

        <div className="mt-12 space-y-12">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="font-display text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
                {s.title}
              </h2>
              <div className="mt-4 space-y-3">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
