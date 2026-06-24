// Utility to format phone numbers for calling and WhatsApp routing.
// Prepend Indian country code (91) if it's a standard 10-digit mobile number.

export function formatPhoneForCall(phone) {
  if (!phone) return ""
  const cleaned = phone.toString().replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `+91${cleaned}`
  }
  // If it already has country code, prepend '+' if not present
  return phone.toString().startsWith("+") ? phone.toString() : `+${cleaned}`
}

export function formatPhoneForWhatsApp(phone) {
  if (!phone) return ""
  const cleaned = phone.toString().replace(/\D/g, "")
  if (cleaned.length === 10) {
    return `91${cleaned}`
  }
  return cleaned
}
