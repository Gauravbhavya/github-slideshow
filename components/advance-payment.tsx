"use client"

import { useState, useTransition } from "react"
import { Copy, IndianRupee, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { formatINR } from "@/lib/pricing"
import { markAdvancePaid } from "@/app/book/payment-actions"

const UPI_ID = "mmrelocations@upi"
const PAYEE_NAME = "M&M Relocations"

export function AdvancePayment({
  bookingId,
  amount,
  paid,
}: {
  bookingId: string
  amount: number
  paid: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [reference, setReference] = useState("")

  if (paid) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4">
        <CheckCircle2 className="h-5 w-5 text-accent" />
        <div>
          <p className="text-sm font-semibold">Advance received</p>
          <p className="text-xs text-muted-foreground">
            We&apos;ll confirm your booking shortly.
          </p>
        </div>
      </div>
    )
  }

  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(
    PAYEE_NAME,
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Advance ${bookingId.slice(0, 8)}`)}`

  const copyUpi = async () => {
    await navigator.clipboard.writeText(UPI_ID)
    toast.success("UPI ID copied")
  }

  const handleMarkPaid = () => {
    if (!reference.trim()) {
      toast.error("Please enter the UPI reference / transaction ID")
      return
    }
    startTransition(async () => {
      const res = await markAdvancePaid(bookingId, reference.trim())
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success("Marked as paid. Awaiting verification.")
      }
    })
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <IndianRupee className="h-4 w-4" />
            Pay {formatINR(amount)} to confirm
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pay the 25% advance via UPI, then submit your transaction reference.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">UPI ID</p>
              <p className="font-mono text-sm font-semibold">{UPI_ID}</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={copyUpi} className="gap-2 bg-transparent">
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1 gap-2">
              <a href={upiUrl}>Pay {formatINR(amount)}</a>
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Tap above on a phone with a UPI app installed (PhonePe, GPay, Paytm, etc.).
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="ref" className="text-sm font-medium">
            UPI reference / transaction ID
          </label>
          <input
            id="ref"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. 123456789012"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button onClick={handleMarkPaid} disabled={isPending} className="w-full gap-2">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "I have paid the advance"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
