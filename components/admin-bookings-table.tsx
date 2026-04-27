import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import {
  HOUSE_LABELS,
  SERVICE_LABELS,
  formatINR,
  type HouseType,
  type ServiceType,
} from "@/lib/pricing"

type BookingRow = {
  id: string
  customer_name: string
  customer_phone: string
  service_type: string
  house_type: string
  pickup_city: string | null
  drop_city: string | null
  move_date: string
  total_price: number
  advance_paid: boolean
  status: string
  created_at: string
}

export function AdminBookingsTable({ bookings }: { bookings: BookingRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-3">Booking</th>
            <th className="px-3 py-3">Customer</th>
            <th className="px-3 py-3">Service</th>
            <th className="px-3 py-3">Move date</th>
            <th className="px-3 py-3">Total</th>
            <th className="px-3 py-3">Advance</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30">
              <td className="px-3 py-3">
                <Link href={`/admin/${b.id}`} className="font-mono text-xs font-semibold hover:underline">
                  #{b.id.slice(0, 8).toUpperCase()}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {new Date(b.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>
              </td>
              <td className="px-3 py-3">
                <p className="font-medium">{b.customer_name}</p>
                <p className="text-xs text-muted-foreground">{b.customer_phone}</p>
              </td>
              <td className="px-3 py-3">
                <p className="text-xs font-medium">{SERVICE_LABELS[b.service_type as ServiceType]}</p>
                <p className="text-xs text-muted-foreground">{HOUSE_LABELS[b.house_type as HouseType]}</p>
              </td>
              <td className="px-3 py-3 text-xs">
                {new Date(b.move_date).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                <p className="text-xs text-muted-foreground">
                  {b.pickup_city} &rarr; {b.drop_city}
                </p>
              </td>
              <td className="px-3 py-3 font-semibold">{formatINR(b.total_price)}</td>
              <td className="px-3 py-3">
                {b.advance_paid ? (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Paid</span>
                ) : (
                  <span className="text-xs font-medium text-accent">Pending</span>
                )}
              </td>
              <td className="px-3 py-3">
                <BookingStatusBadge status={b.status} />
              </td>
              <td className="px-3 py-3 text-right">
                <Button asChild size="sm" variant="ghost" className="gap-1">
                  <Link href={`/admin/${b.id}`}>
                    Manage
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
