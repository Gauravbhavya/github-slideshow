import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Package,
  IndianRupee,
  Phone,
  CheckCircle2,
  MapPin,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { PriceMatrix } from "@/components/price-matrix"

export default function HomePage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/50 to-background">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:gap-12 md:px-6 md:py-24 lg:py-28">
            <div className="flex flex-col justify-center gap-6">
              <Badge variant="secondary" className="w-fit gap-1.5 px-3 py-1 text-xs">
                <Sparkles className="h-3 w-3 text-accent" />
                Trusted in Darbhanga since day one
              </Badge>
              <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                Safe Moves. <span className="text-accent">Smart Relocations.</span>
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                M&amp;M Relocations handles your local and intercity household shifts with transparent pricing,
                careful packing, and zero hidden charges. Get an instant quote in under a minute.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/book">
                    Get an Instant Quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 bg-transparent">
                  <a href="tel:+918084448675">
                    <Phone className="h-4 w-4" />
                    Call Us
                  </a>
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  No hidden charges
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  25% advance only
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  Fully trackable
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border shadow-xl md:aspect-[4/4]">
                <Image
                  src="/hero-moving-truck.jpg"
                  alt="M&M Relocations moving truck with uniformed crew loading household items"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-lg md:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Insured handling</p>
                    <p className="text-xs text-muted-foreground">Furniture wrapped &amp; secured</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="border-b border-border py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Services we offer</h2>
              <p className="mt-3 text-pretty text-muted-foreground">
                Everything you need for a smooth shift, handled by a trained crew.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: MapPin,
                  title: "Local Shifting",
                  desc: "Same-city moves within Darbhanga. Quick turnaround, careful handling.",
                },
                {
                  icon: Truck,
                  title: "Intercity Shifting",
                  desc: "Darbhanga to Patna and growing Bihar-wide soon. Door-to-door service.",
                },
                {
                  icon: Package,
                  title: "Packing & Unpacking",
                  desc: "Basic packing included with the Standard package. Boxes, wrap, and labelling.",
                },
                {
                  icon: Truck,
                  title: "Loading & Unloading",
                  desc: "Trained labour, proper equipment, and safe stacking on every trip.",
                },
                {
                  icon: ShieldCheck,
                  title: "Furniture Handling",
                  desc: "Bed dismantling, AC/TV handling, and heavy item add-ons available.",
                },
                {
                  icon: IndianRupee,
                  title: "Transparent Pricing",
                  desc: "Fixed slabs by home size. See the full price before you book.",
                },
              ].map((s) => (
                <Card key={s.title} className="border-border transition-shadow hover:shadow-md">
                  <CardHeader className="space-y-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/15 text-accent">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="border-b border-border bg-secondary/30 py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="secondary" className="mb-3 px-3 py-1">
                Transparent slabs
              </Badge>
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">Simple, honest pricing</h2>
              <p className="mt-3 text-pretty text-muted-foreground">
                Pick your home size and package. Add-ons are optional, prices are fixed.
              </p>
            </div>

            <div className="mt-12">
              <PriceMatrix />
            </div>

            <div className="mt-10 flex flex-col items-center justify-center gap-4">
              <p className="text-sm text-muted-foreground">
                Need a precise quote with add-ons? Use our calculator.
              </p>
              <Button asChild size="lg" className="gap-2">
                <Link href="/book">
                  Get Your Custom Quote
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="border-b border-border py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 md:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
              <p className="mt-3 text-pretty text-muted-foreground">From quote to delivery in five clear steps.</p>
            </div>

            <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {[
                { n: 1, t: "Tell us your move", d: "Pick service, home size, and addresses." },
                { n: 2, t: "See your price", d: "Instant quote with package and add-ons." },
                { n: 3, t: "Pay 25% advance", d: "Confirm via UPI or bank transfer." },
                { n: 4, t: "We arrive on time", d: "Trained crew packs, loads, and transports." },
                { n: 5, t: "Settle final bill", d: "Pay the rest after safe delivery." },
              ].map((step) => (
                <li
                  key={step.n}
                  className="relative rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step.n}
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{step.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-primary py-16 text-primary-foreground md:py-20">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center md:px-6">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Ready for your next move?
            </h2>
            <p className="max-w-xl text-pretty text-primary-foreground/80">
              Book online in minutes. No hidden charges, no surprises &mdash; just safe moves and smart relocations.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link href="/book">
                  Book Your Move
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="gap-2 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <a href="tel:+918084448675">
                  <Phone className="h-4 w-4" />
                  +91 80844 48675
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
