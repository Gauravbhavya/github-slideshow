"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Star, Check, Info, Lock, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import {
  ADDONS,
  EXTRA_DISTANCE_RATE,
  HOUSE_LABELS,
  PACKAGE_INCLUDES,
  PACKAGE_LABELS,
  PRICE_MATRIX,
  SERVICE_LABELS,
  calculatePrice,
  formatINR,
  type HouseType,
  type PackageType,
  type ServiceType,
} from "@/lib/pricing"
import { createBooking } from "@/app/book/actions"

type Props = {
  isAuthenticated: boolean
  defaultName?: string
  defaultPhone?: string
}

export function BookingFlow({ isAuthenticated, defaultName = "", defaultPhone = "" }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [serviceType, setServiceType] = useState<ServiceType>("local")
  const [houseType, setHouseType] = useState<HouseType>("2bhk")
  const [packageType, setPackageType] = useState<PackageType>("standard")

  const [customerName, setCustomerName] = useState(defaultName)
  const [customerPhone, setCustomerPhone] = useState(defaultPhone)
  const [pickupAddress, setPickupAddress] = useState("")
  const [dropAddress, setDropAddress] = useState("")
  const [pickupCity, setPickupCity] = useState("Darbhanga")
  const [dropCity, setDropCity] = useState(serviceType === "intercity" ? "Patna" : "Darbhanga")
  const [moveDate, setMoveDate] = useState("")
  const [extraDistanceKm, setExtraDistanceKm] = useState<number>(0)
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
  const [notes, setNotes] = useState("")

  const onServiceChange = (s: ServiceType) => {
    setServiceType(s)
    if (s === "intercity") {
      setPickupCity("Darbhanga")
      setDropCity("Patna")
    } else {
      setPickupCity("Darbhanga")
      setDropCity("Darbhanga")
    }
  }

  const breakdown = useMemo(
    () =>
      calculatePrice({
        serviceType,
        houseType,
        packageType,
        selectedAddonIds,
        extraDistanceKm,
      }),
    [serviceType, houseType, packageType, selectedAddonIds, extraDistanceKm],
  )

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const today = new Date().toISOString().split("T")[0]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.info("Please log in to confirm your booking.")
      router.push("/auth/login?redirect=/book")
      return
    }
    startTransition(async () => {
      const res = await createBooking({
        serviceType,
        houseType,
        packageType,
        customerName,
        customerPhone,
        pickupAddress,
        dropAddress,
        pickupCity,
        dropCity,
        moveDate,
        selectedAddonIds,
        extraDistanceKm,
        notes,
      })
      if (res?.error) {
        toast.error(res.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      {/* LEFT: form steps */}
      <div className="space-y-6 lg:col-span-2">
        {/* Step 1: service type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base">
              <StepBadge n={1} />
              Choose service type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(SERVICE_LABELS) as ServiceType[]).map((s) => (
                <SelectableTile
                  key={s}
                  selected={serviceType === s}
                  onClick={() => onServiceChange(s)}
                  title={SERVICE_LABELS[s]}
                  description={s === "local" ? "Same-city moves." : "Door-to-door intercity."}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: house type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base">
              <StepBadge n={2} />
              Home size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {(Object.keys(HOUSE_LABELS) as HouseType[]).map((h) => (
                <SelectableTile
                  key={h}
                  selected={houseType === h}
                  onClick={() => setHouseType(h)}
                  title={HOUSE_LABELS[h]}
                  description={`Base from ${formatINR(PRICE_MATRIX[serviceType][h].basic)}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: package */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base">
              <StepBadge n={3} />
              Choose package
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.keys(PACKAGE_LABELS) as PackageType[]).map((p) => {
                const isStandard = p === "standard"
                const selected = packageType === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPackageType(p)}
                    className={`relative flex flex-col gap-3 rounded-lg border p-4 text-left transition-all ${
                      selected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : "border-border bg-card hover:border-primary/50"
                    }`}
                  >
                    {isStandard && (
                      <Badge className="absolute -top-2 right-3 gap-1 bg-accent text-accent-foreground hover:bg-accent">
                        <Star className="h-3 w-3 fill-current" />
                        Recommended
                      </Badge>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">{PACKAGE_LABELS[p]}</span>
                      <span className="text-lg font-bold">
                        {formatINR(PRICE_MATRIX[serviceType][houseType][p])}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      {PACKAGE_INCLUDES[p].map((i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-accent" />
                          {i}
                        </li>
                      ))}
                    </ul>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 4: pickup & drop */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base">
              <StepBadge n={4} />
              Pickup &amp; drop details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="pickupCity">Pickup city</Label>
                <Input
                  id="pickupCity"
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dropCity">Drop city</Label>
                <Input
                  id="dropCity"
                  value={dropCity}
                  onChange={(e) => setDropCity(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pickupAddress">Pickup address</Label>
              <Textarea
                id="pickupAddress"
                placeholder="House no, street, locality, landmark"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
                rows={2}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dropAddress">Drop address</Label>
              <Textarea
                id="dropAddress"
                placeholder="House no, street, locality, landmark"
                value={dropAddress}
                onChange={(e) => setDropAddress(e.target.value)}
                required
                rows={2}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="moveDate">Preferred move date</Label>
                <Input
                  id="moveDate"
                  type="date"
                  min={today}
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="distance">
                  Extra distance (km){" "}
                  <span className="text-xs text-muted-foreground">
                    ({formatINR(EXTRA_DISTANCE_RATE)}/km)
                  </span>
                </Label>
                <Input
                  id="distance"
                  type="number"
                  min={0}
                  step={1}
                  value={extraDistanceKm}
                  onChange={(e) => setExtraDistanceKm(Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 5: addons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base">
              <StepBadge n={5} />
              Optional add-ons
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {ADDONS.map((a) => {
                const checked = selectedAddonIds.includes(a.id)
                return (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      checked ? "border-accent bg-accent/5" : "border-border bg-card hover:border-accent/50"
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggleAddon(a.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{a.name}</span>
                        <span className="text-sm font-semibold">{formatINR(a.price)}</span>
                      </div>
                      {a.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{a.description}</p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Step 6: contact + notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-base">
              <StepBadge n={6} />
              Your contact details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Rahul Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+91 9XXXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Anything we should know? (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Lift availability, fragile items, parking restrictions, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT: live summary */}
      <aside className="lg:col-span-1">
        <div className="sticky top-20 space-y-4">
          <Card className="border-primary/30">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-base">Price summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <SummaryRow label={SERVICE_LABELS[serviceType]} value={HOUSE_LABELS[houseType]} muted />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Base ({PACKAGE_LABELS[packageType]})
                  </span>
                  <span className="font-medium">{formatINR(breakdown.basePrice)}</span>
                </div>

                {breakdown.selectedAddons.length > 0 && (
                  <div className="space-y-1.5 border-t border-border pt-2">
                    {breakdown.selectedAddons.map((a) => (
                      <div key={a.id} className="flex justify-between">
                        <span className="text-muted-foreground">{a.name}</span>
                        <span className="font-medium">{formatINR(a.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {breakdown.chargeableKm > 0 && (
                  <div className="flex justify-between border-t border-border pt-2">
                    <span className="text-muted-foreground">
                      Extra distance ({breakdown.chargeableKm} km &times; {formatINR(EXTRA_DISTANCE_RATE)})
                    </span>
                    <span className="font-medium">{formatINR(breakdown.extraDistanceCharge)}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-2xl font-bold">{formatINR(breakdown.total)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Advance (25%)</span>
                  <span className="font-semibold">{formatINR(breakdown.advanceAmount)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pay after delivery</span>
                  <span className="font-semibold">{formatINR(breakdown.remainingAmount)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Final price is fixed before confirmation. No hidden charges. Pay 25% to confirm,
                  rest after the move.
                </p>
              </div>

              {isAuthenticated ? (
                <Button type="submit" size="lg" className="w-full gap-2" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      Confirm Booking
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button asChild size="lg" className="w-full gap-2">
                    <Link href="/auth/login?redirect=/book">
                      <Lock className="h-4 w-4" />
                      Login to confirm
                    </Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    New here?{" "}
                    <Link href="/auth/sign-up?redirect=/book" className="font-medium text-foreground underline">
                      Create an account
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </aside>
    </form>
  )
}

function StepBadge({ n }: { n: number }) {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
      {n}
    </span>
  )
}

function SelectableTile({
  selected,
  onClick,
  title,
  description,
}: {
  selected: boolean
  onClick: () => void
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col gap-1 rounded-lg border p-4 text-left transition-all ${
        selected
          ? "border-primary bg-primary/5 ring-2 ring-primary/30"
          : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground">{description}</span>
    </button>
  )
}

function SummaryRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
