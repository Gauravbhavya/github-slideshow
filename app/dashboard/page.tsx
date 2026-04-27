import Link from "next/link"
import { redirect } from "next/navigation"
import { Truck, Plus, Calendar, MapPin, Package as PackageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import { BookingProgressBar } from "@/components/booking-progress-bar"
import { createClient } from "@/lib/supabase/server"
import {
  HOUSE_LABELS,
  PACKAGE_LABELS,
  SERVICE_LABELS,
  formatINR,
  type HouseType,
  type PackageType,
  type ServiceType,
} from "@/lib/pricing"

export const metadata = {
  title: "My Bookings | M&M Relocations",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirect=/dashboard")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const list = bookings ?? []
  const greeting = profile?.full_name ? `Hi, ${profile.full_name.split(" ")[0]}` : "Welcome back"

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30 py-10 md:py-14">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">{greeting}</h1>
              <p className="mt-1 text-muted-foreground">
                {list.length === 0
                  ? "You don't have any bookings yet. Get started below."
                  : `You have ${list.length} booking${list.length === 1 ? "" : "s"}.`}
              </p>
            </div>
            <Button asChild className="gap-2">
              <Link href="/book">
                <Plus className="h-4 w-4" />
                New booking
              </Link>
            </Button>
          </div>

          {list.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                  <Truck className="h-7 w-7" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold">No bookings yet</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get an instant quote and book your first move with M&amp;M Relocations.
                  </p>
                </div>
                <Button asChild className="gap-2">
                  <Link href="/book">
                    Get a quote
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {list.map((b) => (
                <Card key={b.id} className="overflow-hidden">
                  <CardHeader className="border-b border-border bg-muted/30 pb-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-base font-semibold">
                          {SERVICE_LABELS[b.service_type as ServiceType]}
                        </CardTitle>
                        <p className="font-mono text-xs text-muted-foreground">
                          #{b.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <BookingStatusBadge status={b.status as string} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-5">
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                      <Meta icon={PackageIcon} label="Home & package">
                        {HOUSE_LABELS[b.house_type as HouseType]} &middot; {PACKAGE_LABELS[b.package_type as PackageType]}
                      </Meta>
                      <Meta icon={Calendar} label="Move date">
                        {new Date(b.move_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </Meta>
                      <Meta icon={MapPin} label="Route">
                        {b.pickup_city || "—"} &rarr; {b.drop_city || "—"}
                      </Meta>
                    </div>

                    <BookingProgressBar status={b.status as string} />

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                      <div className="space-y-0.5">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
                        <p className="text-lg font-bold">{formatINR(b.total_price)}</p>
                        {!b.advance_paid && (
                          <p className="text-xs text-accent">
                            Advance pending: {formatINR(b.advance_amount)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/dashboard/${b.id}`}>View details</Link>
                        </Button>
                        {!b.advance_paid && (
                          <Button asChild size="sm">
                            <Link href={`/book/success/${b.id}`}>Pay advance</Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function Meta({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Calendar
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{children}</p>
      </div>
    </div>
  )
}
