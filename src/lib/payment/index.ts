import { createDokuProvider } from "./doku/client"
import type { PaymentProvider } from "./provider"

// Singleton provider — DOKU is current, Xendit deprecated
let cached: PaymentProvider | null = null

export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached
  // In future, could switch based on env DOKU_ENV or feature flag
  cached = createDokuProvider()
  return cached
}

export * from "./provider"
