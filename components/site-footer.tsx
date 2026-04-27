import Link from "next/link"
import { Truck, Phone, MapPin, Mail } from "lucide-react"

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Truck className="h-5 w-5" />
              </span>
              <span className="flex flex-col leading-tight">
                <span className="text-base font-bold">M&amp;M Relocations</span>
                <span className="text-[11px] text-muted-foreground">Safe Moves. Smart Relocations.</span>
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Trusted packers and movers based in Darbhanga, Bihar. We handle local and intercity household shifting
              with transparent pricing and no hidden charges.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Services</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/#services" className="hover:text-foreground">
                  Local Shifting
                </Link>
              </li>
              <li>
                <Link href="/#services" className="hover:text-foreground">
                  Intercity Shifting
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-foreground">
                  Get a Quote
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Darbhanga, Bihar</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                <a href="tel:+918084448675" className="hover:text-foreground">
                  +91 80844 48675
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                <a href="mailto:Grvbhavya79@gmail.com" className="break-all hover:text-foreground">
                  Grvbhavya79@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} M&amp;M Relocations. All rights reserved.</p>
          <p>Darbhanga → Patna → Bihar-wide expansion soon</p>
        </div>
      </div>
    </footer>
  )
}
