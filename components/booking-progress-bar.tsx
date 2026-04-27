import { Check } from "lucide-react"
import { STATUS_FLOW, STATUS_LABELS } from "@/lib/pricing"

export function BookingProgressBar({ status }: { status: string }) {
  if (status === "cancelled") {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
        Booking cancelled
      </div>
    )
  }

  const currentIdx = STATUS_FLOW.indexOf(status as (typeof STATUS_FLOW)[number])
  const safeIdx = currentIdx === -1 ? 0 : currentIdx

  return (
    <ol className="flex items-center gap-1">
      {STATUS_FLOW.map((s, i) => {
        const isDone = i < safeIdx
        const isCurrent = i === safeIdx
        return (
          <li key={s} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center gap-1">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  isDone
                    ? "bg-accent text-accent-foreground"
                    : isCurrent
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/15"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              {i < STATUS_FLOW.length - 1 && (
                <span
                  className={`h-0.5 flex-1 rounded ${
                    i < safeIdx ? "bg-accent" : "bg-muted"
                  }`}
                />
              )}
            </div>
            <span
              className={`text-[10px] font-medium uppercase tracking-wide ${
                isCurrent ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {STATUS_LABELS[s]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
