"use client"

import { useState, useTransition } from "react"
import { CheckCircle2, Truck, Loader2, IndianRupee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  assignBookingResources,
  confirmAdvancePaid,
  updateBookingStatus,
} from "@/app/admin/actions"
import { STATUS_LABELS } from "@/lib/pricing"

type Props = {
  bookingId: string
  status: string
  advancePaid: boolean
  vehicle: string
  crew: string
}

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
] as const

export function AdminBookingControls({ bookingId, status, advancePaid, vehicle, crew }: Props) {
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState(status)
  const [vehicleVal, setVehicleVal] = useState(vehicle)
  const [crewVal, setCrewVal] = useState(crew)

  const handleStatus = (newStatus: string) => {
    setCurrentStatus(newStatus)
    startTransition(async () => {
      const res = await updateBookingStatus(bookingId, newStatus)
      if (res?.error) toast.error(res.error)
      else toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`)
    })
  }

  const handleAssign = () => {
    if (!vehicleVal.trim() && !crewVal.trim()) {
      toast.error("Enter a vehicle or crew name")
      return
    }
    startTransition(async () => {
      const res = await assignBookingResources(bookingId, {
        vehicle: vehicleVal,
        crew: crewVal,
      })
      if (res?.error) toast.error(res.error)
      else toast.success("Assignment saved")
    })
  }

  const handleConfirmAdvance = () => {
    startTransition(async () => {
      const res = await confirmAdvancePaid(bookingId)
      if (res?.error) toast.error(res.error)
      else toast.success("Advance confirmed")
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Update status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select value={currentStatus} onValueChange={handleStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isPending && (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4" />
            Assign vehicle &amp; crew
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="vehicle">Vehicle</Label>
            <Input
              id="vehicle"
              value={vehicleVal}
              onChange={(e) => setVehicleVal(e.target.value)}
              placeholder="e.g. Tata Ace BR-07-AB-1234"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="crew">Crew</Label>
            <Input
              id="crew"
              value={crewVal}
              onChange={(e) => setCrewVal(e.target.value)}
              placeholder="e.g. Ravi + 2 helpers"
            />
          </div>
          <Button onClick={handleAssign} disabled={isPending} className="w-full">
            Save assignment
          </Button>
        </CardContent>
      </Card>

      {!advancePaid && (
        <Card className="border-accent/30 bg-accent/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <IndianRupee className="h-4 w-4" />
              Advance payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Mark the advance as received once you&apos;ve verified the UPI transfer.
            </p>
            <Button
              onClick={handleConfirmAdvance}
              disabled={isPending}
              className="w-full gap-2"
              variant="default"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm advance received
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
