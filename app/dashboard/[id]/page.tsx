import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Phone, MapPin, Calendar, Truck, User as UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import { BookingProgressBar } from "@/components/booking-progress-bar"
import { AdvancePayment } from "@/components/advance-payment"
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

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=/dashboard/${id}`)

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
        <div className="mx-auto max-w-3xl space-y-6 px-4 md:px-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to bookings
          </Link>

          <Card>
            <CardHeader className="space-y-3 border-b border-border">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-xl">
                    {SERVICE_LABELS[booking.service_type as ServiceType]}
                  </CardTitle>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    #{booking.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <BookingStatusBadge status={booking.status as string} />
              </div>
              <BookingProgressBar status={booking.status as string} />
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem icon={Truck} label="Home & package">
                  {HOUSE_LABELS[booking.house_type as HouseType]} &middot;{" "}
                  {PACKAGE_LABELS[booking.package_type as PackageType]}
                </DetailItem>
                <DetailItem icon={Calendar} label="Move date">
                  {new Date(booking.move_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </DetailItem>
                <DetailItem icon={UserIcon} label="Contact">
                  {booking.customer_name}
                </DetailItem>
                <DetailItem icon={Phone} label="Phone">
                  {booking.customer_phone}
                </DetailItem>
                <DetailItem icon={MapPin} label="Pickup" full>
                  {booking.pickup_address}
                </DetailItem>
                <DetailItem icon={MapPin} label="Drop" full>
                  {booking.drop_address}
                </DetailItem>
              </div>

              {booking.assigned_vehicle || booking.assigned_crew ? (
                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <h3 className="text-sm font-semibold">Assignment</h3>
                  <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                    {booking.assigned_vehicle && (
                      <p>
                        <span className="text-muted-foreground">Vehicle:</span>{" "}
                        <span className="font-medium">{booking.assigned_vehicle}</span>
                      </p>
                    )}
                    {booking.assigned_crew && (
                      <p>
                        <span className="text-muted-foreground">Crew:</span>{" "}
                        <span className="font-medium">{booking.assigned_crew}</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="space-y-2 rounded-lg border border-border bg-card p-4">
                <PriceRow label="Base price" value={formatINR(booking.base_price)} />
                {booking.booking_addons?.length > 0 && (
                  <>
                    {booking.booking_addons.map(
                      (a: { id: string; name: string; price: number }) => (
                        <PriceRow key={a.id} label={a.name} value={formatINR(a.price)} muted />
                      ),
                    )}
                  </>
                )}
                {booking.extra_distance_charge > 0 && (
                  <PriceRow
                    label={`Extra distance (${booking.extra_distance_km} km)`}
                    value={formatINR(booking.extra_distance_charge)}
                    muted
                  />
                )}
                <div className="my-2 border-t border-border" />
                <PriceRow label="Total" value={formatINR(booking.total_price)} bold />
                <PriceRow
                  label={booking.advance_paid ? "Advance paid" : "Advance to pay"}
                  value={formatINR(booking.advance_amount)}
                  highlight={!booking.advance_paid}
                />
                <PriceRow
                  label="Balance after delivery"
                  value={formatINR(booking.total_price - booking.advance_amount)}
                />
              </div>

              <AdvancePayment
                bookingId={booking.id}
                amount={booking.advance_amount}
                paid={booking.advance_paid}
              />
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function DetailItem({
  icon: Icon,
  label,
  children,
  full,
}: {
  icon: typeof Calendar
  label: string
  children: React.ReactNode
  full?: boolean
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 text-sm font-medium">{children}</p>
    </div>
  )
}

function PriceRow({
  label,
  value,
  bold,
  muted,
  highlight,
}: {
  label: string
  value: string
  bold?: boolean
  muted?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={highlight ? "font-medium text-accent" : muted ? "text-muted-foreground" : ""}>
        {label}
      </span>
      <span className={`${bold ? "text-base font-bold" : "font-medium"} ${highlight ? "text-accent" : ""}`}>
        {value}
      </span>
    </div>
  )
}
