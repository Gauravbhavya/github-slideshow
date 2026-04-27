import Link from "next/link"
import { redirect } from "next/navigation"
import { ShieldCheck, IndianRupee, Calendar, Users, Truck, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BookingStatusBadge } from "@/components/booking-status-badge"
import { AdminBookingsTable } from "@/components/admin-bookings-table"
import { createClient } from "@/lib/supabase/server"
import { formatINR } from "@/lib/pricing"

export const metadata = {
  title: "Admin | M&M Relocations",
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status: statusFilter } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login?redirect=/admin")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || profile.role !== "admin") {
    return (
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center bg-secondary/30 p-6">
          <Card className="max-w-md">
            <CardHeader className="space-y-2 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-6 w-6" />
              </span>
              <CardTitle>Admin access required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Your account doesn&apos;t have admin permissions. Contact an existing admin to be promoted.
              </p>
              <Button asChild>
                <Link href="/dashboard">Back to my bookings</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </div>
    )
  }

  let query = supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter)
  }

  const { data: bookings } = await query
  const { data: allBookings } = await supabase.from("bookings").select("status,total_price,advance_paid")

  const list = bookings ?? []
  const all = allBookings ?? []

  const totalBookings = all.length
  const pending = all.filter((b) => b.status === "pending").length
  const inProgress = all.filter((b) =>
    ["confirmed", "assigned", "in_progress"].includes(b.status as string),
  ).length
  const completedRevenue = all
    .filter((b) => b.status === "completed")
    .reduce((s, b) => s + (b.total_price ?? 0), 0)

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30 py-10 md:py-14">
        <div className="mx-auto max-w-6xl space-y-8 px-4 md:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-balance text-3xl font-bold tracking-tight">Admin panel</h1>
                <p className="text-sm text-muted-foreground">
                  Manage bookings, assignments, and operations.
                </p>
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Calendar} label="Total bookings" value={totalBookings.toString()} />
            <StatCard icon={Users} label="Pending review" value={pending.toString()} accent />
            <StatCard icon={Truck} label="In pipeline" value={inProgress.toString()} />
            <StatCard
              icon={IndianRupee}
              label="Revenue (completed)"
              value={formatINR(completedRevenue)}
            />
          </div>

          {/* FILTERS + TABLE */}
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base">All bookings</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "all", label: "All" },
                  { key: "pending", label: "Pending" },
                  { key: "confirmed", label: "Confirmed" },
                  { key: "assigned", label: "Assigned" },
                  { key: "in_progress", label: "In progress" },
                  { key: "completed", label: "Completed" },
                ].map((f) => {
                  const active = (statusFilter ?? "all") === f.key
                  return (
                    <Button
                      key={f.key}
                      asChild
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className={active ? "" : "bg-transparent"}
                    >
                      <Link href={f.key === "all" ? "/admin" : `/admin?status=${f.key}`}>
                        {f.label}
                      </Link>
                    </Button>
                  )
                })}
              </div>
            </CardHeader>
            <CardContent>
              {list.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-10 text-center">
                  <p className="text-sm text-muted-foreground">No bookings match this filter.</p>
                </div>
              ) : (
                <AdminBookingsTable bookings={list} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Calendar
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            accent ? "bg-accent/15 text-accent" : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}
