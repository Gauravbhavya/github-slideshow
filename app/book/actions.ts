"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  ADDONS,
  calculatePrice,
  type ServiceType,
  type HouseType,
  type PackageType,
} from "@/lib/pricing"

export type CreateBookingInput = {
  serviceType: ServiceType
  houseType: HouseType
  packageType: PackageType
  customerName: string
  customerPhone: string
  pickupAddress: string
  dropAddress: string
  pickupCity: string
  dropCity: string
  moveDate: string
  selectedAddonIds: string[]
  extraDistanceKm: number
  notes?: string
}

export async function createBooking(input: CreateBookingInput) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to book." }
  }

  // Validate
  if (!input.customerName.trim() || !input.customerPhone.trim()) {
    return { error: "Name and phone are required." }
  }
  if (!input.pickupAddress.trim() || !input.dropAddress.trim()) {
    return { error: "Pickup and drop addresses are required." }
  }
  if (!input.moveDate) {
    return { error: "Please select a move date." }
  }

  const breakdown = calculatePrice({
    serviceType: input.serviceType,
    houseType: input.houseType,
    packageType: input.packageType,
    selectedAddonIds: input.selectedAddonIds,
    extraDistanceKm: input.extraDistanceKm,
  })

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      service_type: input.serviceType,
      house_type: input.houseType,
      package_type: input.packageType,
      pickup_address: input.pickupAddress,
      drop_address: input.dropAddress,
      pickup_city: input.pickupCity || null,
      drop_city: input.dropCity || null,
      move_date: input.moveDate,
      base_price: breakdown.basePrice,
      addons_total: breakdown.addonsTotal,
      extra_distance_km: breakdown.extraDistanceKm,
      extra_distance_charge: breakdown.extraDistanceCharge,
      total_price: breakdown.total,
      advance_amount: breakdown.advanceAmount,
      advance_paid: false,
      status: "pending",
      notes: input.notes || null,
    })
    .select("id")
    .single()

  if (error || !booking) {
    return { error: error?.message ?? "Failed to create booking." }
  }

  // Insert add-ons
  const selectedAddons = ADDONS.filter((a) => input.selectedAddonIds.includes(a.id))
  if (selectedAddons.length > 0) {
    await supabase.from("booking_addons").insert(
      selectedAddons.map((a) => ({
        booking_id: booking.id,
        name: a.name,
        price: a.price,
      })),
    )
  }

  revalidatePath("/dashboard")
  redirect(`/book/success/${booking.id}`)
}
