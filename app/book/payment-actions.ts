"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function markAdvancePaid(bookingId: string, reference: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("bookings")
    .update({
      advance_paid: true,
      notes: `UPI ref: ${reference}`,
      status: "confirmed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("user_id", user.id)

  if (error) return { error: error.message }

  revalidatePath(`/book/success/${bookingId}`)
  revalidatePath("/dashboard")
  return { success: true }
}
