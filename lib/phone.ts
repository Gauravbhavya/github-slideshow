// Helpers for working with Indian mobile numbers in E.164 format.

/**
 * Normalize any user-entered phone number into E.164 (+91XXXXXXXXXX).
 * Accepts inputs like "9876543210", "+91 98765 43210", "09876543210", etc.
 */
export function normalizePhone(input: string): string {
  const digits = (input ?? "").replace(/\D/g, "")
  if (!digits) return ""

  // 10 digit local: assume India
  if (digits.length === 10) return `+91${digits}`

  // 11 digit starting with 0: strip leading 0
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`

  // 12 digit starting with 91
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`

  // Already has country code
  if (input.trim().startsWith("+")) return `+${digits}`

  return `+${digits}`
}

/** True if the value is a valid Indian mobile number in E.164 format. */
export function isValidIndianPhone(e164: string): boolean {
  return /^\+91[6-9]\d{9}$/.test(e164)
}

/** Pretty-print an E.164 Indian phone number as "+91 9XXXX XXXXX". */
export function formatPhoneDisplay(e164: string): string {
  const m = e164.match(/^\+91(\d{5})(\d{5})$/)
  if (m) return `+91 ${m[1]} ${m[2]}`
  return e164
}
