import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, Phone, MapPin, Calendar, Truck, User as UserIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import { BookingProgressBar } from "@/components/booking-progress-bar"
import { AdminBookingControls } from "@/components/admin-booking-controls"
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

export default async function AdminBookingDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/auth/login?redirect=/admin/${id}`)

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") redirect("/dashboard")

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
        <div className="mx-auto grid max-w-5xl gap-6 px-4 md:px-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all bookings
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
                  <DetailItem icon={UserIcon} label="Customer">
                    {booking.customer_name}
                  </DetailItem>
                  <DetailItem icon={Phone} label="Phone">
                    <a href={`tel:${booking.customer_phone}`} className="hover:underline">
                      {booking.customer_phone}
                    </a>
                  </DetailItem>
                  <DetailItem icon={MapPin} label="Pickup" full>
                    {booking.pickup_address}
                  </DetailItem>
                  <DetailItem icon={MapPin} label="Drop" full>
                    {booking.drop_address}
                  </DetailItem>
                </div>

                <div className="space-y-2 rounded-lg border border-border bg-card p-4">
                  <PriceRow label="Base price" value={formatINR(booking.base_price)} />
                  {booking.booking_addons?.map(
                    (a: { id: string; name: string; price: number }) => (
                      <PriceRow key={a.id} label={a.name} value={formatINR(a.price)} muted />
                    ),
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
                    label={booking.advance_paid ? "Advance paid" : "Advance pending"}
                    value={formatINR(booking.advance_amount)}
                    highlight={!booking.advance_paid}
                  />
                </div>

                {booking.notes && (
                  <div className="rounded-lg border border-border bg-muted p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Notes</p>
                    <p className="mt-1 text-sm">{booking.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="lg:sticky lg:top-20 lg:h-fit">
            <AdminBookingControls
              bookingId={booking.id}
              status={booking.status as string}
              advancePaid={booking.advance_paid}
              vehicle={booking.assigned_vehicle ?? ""}
              crew={booking.assigned_crew ?? ""}
            />
          </aside>
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
