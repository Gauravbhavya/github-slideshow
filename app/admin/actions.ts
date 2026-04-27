"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Not authenticated", supabase }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin") {
    return { ok: false, error: "Forbidden: admin access required", supabase }
  }
  return { ok: true, supabase, userId: user.id }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const auth = await assertAdmin()
  if (!auth.ok) return { error: auth.error }

  const allowed = ["pending", "confirmed", "assigned", "in_progress", "completed", "cancelled"]
  if (!allowed.includes(status)) return { error: "Invalid status" }

  const { error } = await auth.supabase
    .from("bookings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", bookingId)

  if (error) return { error: error.message }

  revalidatePath("/admin")
  revalidatePath(`/admin/${bookingId}`)
  return { success: true }
}

export async function assignBookingResources(
  bookingId: string,
  data: { vehicle: string; crew: string },
) {
  const auth = await assertAdmin()
  if (!auth.ok) return { error: auth.error }

  const { error } = await auth.supabase
    .from("bookings")
    .update({
      assigned_vehicle: data.vehicle || null,
      assigned_crew: data.crew || null,
      status: "assigned",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (error) return { error: error.message }

  revalidatePath("/admin")
  revalidatePath(`/admin/${bookingId}`)
  return { success: true }
}

export async function confirmAdvancePaid(bookingId: string) {
  const auth = await assertAdmin()
  if (!auth.ok) return { error: auth.error }

  const { error } = await auth.supabase
    .from("bookings")
    .update({
      advance_paid: true,
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)

  if (error) return { error: error.message }

  revalidatePath("/admin")
  revalidatePath(`/admin/${bookingId}`)
  return { success: true }
}
