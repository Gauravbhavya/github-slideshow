// M&M Relocations pricing engine
// Single source of truth used by the landing page, calculator, booking flow, and admin.

export type ServiceType = "local" | "intercity"
export type HouseType = "1bhk" | "2bhk" | "3bhk"
export type PackageType = "basic" | "standard"

export type Addon = {
  id: string
  name: string
  price: number
  description?: string
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  local: "Local Shifting (Darbhanga)",
  intercity: "Intercity (Darbhanga \u2192 Patna)",
}

export const HOUSE_LABELS: Record<HouseType, string> = {
  "1bhk": "1 BHK",
  "2bhk": "2 BHK",
  "3bhk": "3 BHK",
}

export const PACKAGE_LABELS: Record<PackageType, string> = {
  basic: "Basic",
  standard: "Standard",
}

export const PACKAGE_INCLUDES: Record<PackageType, string[]> = {
  basic: ["Transport", "Labour", "Loading & Unloading"],
  standard: ["Transport", "Labour", "Loading & Unloading", "Basic Packing"],
}

// Core price matrix from the business spec.
export const PRICE_MATRIX: Record<ServiceType, Record<HouseType, Record<PackageType, number>>> = {
  local: {
    "1bhk": { basic: 5000, standard: 6500 },
    "2bhk": { basic: 6500, standard: 8000 },
    "3bhk": { basic: 9000, standard: 11000 },
  },
  intercity: {
    "1bhk": { basic: 8500, standard: 10500 },
    "2bhk": { basic: 11000, standard: 13500 },
    "3bhk": { basic: 15000, standard: 18000 },
  },
}

export const ADDONS: Addon[] = [
  { id: "ac", name: "AC handling", price: 800, description: "Disconnect, wrap, and reinstall" },
  { id: "tv", name: "TV handling", price: 600, description: "Safe wrap and mount" },
  { id: "bed", name: "Bed dismantling", price: 800, description: "Dismantle and reassemble" },
  { id: "heavy", name: "Heavy item (each)", price: 400, description: "Almirah, sofa-cum-bed, etc." },
]

export const EXTRA_DISTANCE_RATE = 25 // INR per km of extra distance

export const ADVANCE_PERCENT = 0.25 // 25% advance

export type PriceInput = {
  serviceType: ServiceType
  houseType: HouseType
  packageType: PackageType
  selectedAddonIds: string[]
  extraDistanceKm: number // extra distance in km (every km is chargeable)
}

export type PriceBreakdown = {
  basePrice: number
  addonsTotal: number
  selectedAddons: Addon[]
  extraDistanceKm: number
  chargeableKm: number
  extraDistanceCharge: number
  total: number
  advanceAmount: number
  remainingAmount: number
}

export function calculatePrice(input: PriceInput): PriceBreakdown {
  const basePrice = PRICE_MATRIX[input.serviceType][input.houseType][input.packageType]

  const selectedAddons = ADDONS.filter((a) => input.selectedAddonIds.includes(a.id))
  const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)

  const chargeableKm = Math.max(0, input.extraDistanceKm)
  const extraDistanceCharge = chargeableKm * EXTRA_DISTANCE_RATE

  const total = basePrice + addonsTotal + extraDistanceCharge
  const advanceAmount = Math.round(total * ADVANCE_PERCENT)
  const remainingAmount = total - advanceAmount

  return {
    basePrice,
    addonsTotal,
    selectedAddons,
    extraDistanceKm: input.extraDistanceKm,
    chargeableKm,
    extraDistanceCharge,
    total,
    advanceAmount,
    remainingAmount,
  }
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const STATUS_FLOW: Array<keyof typeof STATUS_LABELS> = [
  "pending",
  "confirmed",
  "assigned",
  "in_progress",
  "completed",
]
