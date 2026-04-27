import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS } from "@/lib/pricing"

const STATUS_CLASSES: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-primary/10 text-primary",
  assigned: "bg-accent/15 text-accent",
  in_progress: "bg-accent/20 text-accent",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-destructive/10 text-destructive",
}

export function BookingStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={`border-0 ${STATUS_CLASSES[status] ?? "bg-muted text-muted-foreground"}`}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
