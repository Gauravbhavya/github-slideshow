import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BookingFlow } from "@/components/booking-flow"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Book Your Move | M&M Relocations",
  description: "Get an instant quote and book your local or intercity move with M&M Relocations.",
}

export default async function BookPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let defaults: { name: string; phone: string } = { name: "", phone: "" }
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle()
    defaults = {
      name: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/30 py-10 md:py-14">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="mb-8 max-w-2xl">
            <h1 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Get your instant quote
            </h1>
            <p className="mt-2 text-pretty text-muted-foreground">
              Pick your service, home size, and package. Add optional services as needed.
              Your final price updates live.
            </p>
          </div>
          <BookingFlow
            isAuthenticated={!!user}
            defaultName={defaults.name}
            defaultPhone={defaults.phone}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
