import Link from "next/link"
import { Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "@/components/user-menu"

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role: string | null = null
  let displayName: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
    role = profile?.role ?? "customer"
    displayName = profile?.full_name || profile?.phone || user.phone || ""
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Truck className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-base font-bold tracking-tight">M&amp;M Relocations</span>
            <span className="hidden text-[11px] text-muted-foreground sm:block">Safe Moves. Smart Relocations.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/#services" className="text-muted-foreground transition-colors hover:text-foreground">
            Services
          </Link>
          <Link href="/#pricing" className="text-muted-foreground transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link href="/book" className="text-muted-foreground transition-colors hover:text-foreground">
            Get a Quote
          </Link>
          <Link href="/#contact" className="text-muted-foreground transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu displayName={displayName ?? ""} role={role ?? "customer"} />
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/book">Book Now</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
