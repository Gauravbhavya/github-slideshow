import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { CheckCircle2, ArrowRight, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AdvancePayment } from "@/components/advance-payment"
import { createClient } from "@/lib/supabase/server"
import {
  HOUSE_LABELS,
  PACKAGE_LABELS,
  SERVICE_LABELS,
  STATUS_LABELS,
  formatINR,
  type HouseType,
  type PackageType,
  type ServiceType,
} from "@/lib/pricing"

export default async function BookingSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=/book/success/${id}`)

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, booking_addons(*)")
    .eq("id", id)
    .single()

  if (!booking) notFound()

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30 py-10 md:py-14">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <Card className="border-accent/30">
            <CardHeader className="space-y-3 border-b border-border bg-accent/5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent">
                  <CheckCircle2 className="h-6 w-6" />
                </span>
                <div>
                  <CardTitle className="text-xl">Booking received!</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Booking ID: <span className="font-mono">{booking.id.slice(0, 8).toUpperCase()}</span>
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit">
                Status: {STATUS_LABELS[booking.status as string]}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Service" value={SERVICE_LABELS[booking.service_type as ServiceType]} />
                <Detail label="Home size" value={HOUSE_LABELS[booking.house_type as HouseType]} />
                <Detail label="Package" value={PACKAGE_LABELS[booking.package_type as PackageType]} />
                <Detail label="Move date" value={new Date(booking.move_date).toLocaleDateString("en-IN")} />
                <Detail label="Pickup" value={booking.pickup_address} />
                <Detail label="Drop" value={booking.drop_address} />
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-card p-4">
                <PriceRow label="Base price" value={formatINR(booking.base_price)} />
                {booking.addons_total > 0 && (
                  <PriceRow label="Add-ons" value={formatINR(booking.addons_total)} />
                )}
                {booking.extra_distance_charge > 0 && (
                  <PriceRow
                    label={`Extra distance (${booking.extra_distance_km} km)`}
                    value={formatINR(booking.extra_distance_charge)}
                  />
                )}
                <div className="my-2 border-t border-border" />
                <PriceRow label="Total" value={formatINR(booking.total_price)} bold />
                <PriceRow
                  label="Advance to pay (25%)"
                  value={formatINR(booking.advance_amount)}
                  highlight
                />
              </div>

              <AdvancePayment
                bookingId={booking.id}
                amount={booking.advance_amount}
                paid={booking.advance_paid}
              />

              <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
                <Button asChild>
                  <Link href="/dashboard">
                    Go to my bookings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="gap-2 bg-transparent">
                  <a href="tel:+919999999999">
                    <Phone className="h-4 w-4" />
                    Call us
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium">{value}</p>
    </div>
  )
}

function PriceRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string
  value: string
  bold?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={highlight ? "font-medium text-accent" : "text-muted-foreground"}>{label}</span>
      <span className={`${bold ? "text-base font-bold" : "font-medium"} ${highlight ? "text-accent" : ""}`}>
        {value}
      </span>
    </div>
  )
}
