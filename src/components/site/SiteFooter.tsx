import { Link } from "@tanstack/react-router";
import { Instagram, Mail, Phone } from "lucide-react";
import { ScrollFx } from "@/components/site/ScrollFx";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1400px] overflow-x-hidden px-5 py-14 sm:px-8">
        <ScrollFx variant="stagger" className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="min-w-0">
            <span className="font-display text-2xl font-extrabold tracking-[-0.06em]">ESKO</span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A short line of heavyweight essentials, cut and sewn in Tiruppur for Indian weather.
            </p>
            <p className="deva mt-3 text-sm text-muted-foreground">रोज़ पहनने के लिए बना।</p>
          </div>

          <FooterCol title="Shop">
            <Link to="/shop" className="footer-link">
              All products
            </Link>
            <Link to="/product/$slug" params={{ slug: "terra-oversized-tee" }} className="footer-link">
              Terra Tee
            </Link>
            <Link to="/product/$slug" params={{ slug: "drift-linen-shirt" }} className="footer-link">
              Drift Shirt
            </Link>
            <Link to="/cart" className="footer-link">
              Cart
            </Link>
          </FooterCol>

          <FooterCol title="Support">
            <Link to="/track" className="footer-link">
              Track your order
            </Link>
            <Link to="/policies" hash="shipping" className="footer-link">
              Shipping
            </Link>
            <Link to="/policies" hash="returns" className="footer-link">
              15-day returns
            </Link>
            <Link to="/policies" hash="privacy" className="footer-link">
              Privacy
            </Link>
          </FooterCol>

          <FooterCol title="Contact">
            <a href="mailto:care@esko.in" className="footer-link inline-flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> care@esko.in
            </a>
            <a href="tel:+918047182200" className="footer-link inline-flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> +91 80 4718 2200
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer noopener"
              className="footer-link inline-flex items-center gap-2"
            >
              <Instagram className="h-3.5 w-3.5" /> @esko.in
            </a>
          </FooterCol>
        </ScrollFx>

        <ScrollFx
          variant="fade-up"
          delay={0.1}
          className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"
        >
          <p>© {new Date().getFullYear()} Esko Apparel Pvt. Ltd. Bengaluru, India.</p>
          <p>GST 29AAECE1234F1Z5 · Prices include all taxes</p>
        </ScrollFx>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 transition-transform duration-300 hover:-translate-y-0.5">
      <p className="eyebrow text-muted-foreground">{title}</p>
      <div className="mt-4 flex flex-col gap-2.5 text-sm [&_.footer-link]:inline-block [&_.footer-link]:text-foreground/80 [&_.footer-link]:transition-all [&_.footer-link]:duration-200 [&_.footer-link:hover]:translate-x-1 [&_.footer-link:hover]:text-accent">
        {children}
      </div>
    </div>
  );
}
