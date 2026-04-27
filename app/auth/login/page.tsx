"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, Truck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { normalizePhone, isValidIndianPhone, formatPhoneDisplay } from "@/lib/phone"

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") ?? "/dashboard"

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const normalized = normalizePhone(phone)
    if (!isValidIndianPhone(normalized)) {
      setError("Enter a valid 10-digit Indian mobile number.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        phone: normalized,
        options: { channel: "sms" },
      })
      if (error) throw error
      setPhone(normalized)
      setStep("otp")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send OTP")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (otp.length !== 6) {
      setError("Enter the 6-digit OTP.")
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "sms",
      })
      if (error) throw error
      router.push(redirectTo)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid OTP")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-secondary/30 p-6 md:p-10">
      <Link href="/" className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Truck className="h-5 w-5" />
        </span>
        <span className="text-base font-bold tracking-tight">M&amp;M Relocations</span>
      </Link>

      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {step === "phone" ? "Welcome back" : "Verify your number"}
            </CardTitle>
            <CardDescription>
              {step === "phone"
                ? "Login with your mobile number. We'll send you a one-time password."
                : `Enter the 6-digit OTP sent to ${formatPhoneDisplay(phone)}.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "phone" ? (
              <form onSubmit={sendOtp}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Mobile number</Label>
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 items-center rounded-md border border-input bg-muted px-3 text-sm font-medium text-foreground">
                        +91
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        placeholder="9XXXXXXXXX"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  New to M&amp;M Relocations?{" "}
                  <Link
                    href={`/auth/sign-up${redirectTo !== "/dashboard" ? `?redirect=${redirectTo}` : ""}`}
                    className="font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Create an account
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={verifyOtp}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="otp">One-time password</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      placeholder="123456"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Verify & Login"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("phone")
                      setOtp("")
                      setError(null)
                    }}
                    className="inline-flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Use a different number
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
