// Payment provider abstraction — DOKU is current, Xendit deprecated
// Production DOKU can replace Sandbox via env without rewriting flow

export type PaymentCreateParams = {
  transactionId: string // internal UUID
  peletonId: string
  peletonSlug: string
  userId: string
  quantity: number
  amount: number // in IDR
  email?: string
}

export type PaymentCreateResult = {
  provider: "DOKU"
  providerReference: string // partnerReferenceNo (our transactionId) or DOKU referenceNo
  qrContent: string // EMV QR string to render
  qrUrl?: string // if DOKU returns URL, else use qrContent
  referenceNo?: string // DOKU's referenceNo
  expiresAt?: string
  rawResponse?: any
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED"

export interface PaymentProvider {
  readonly name: "DOKU"
  createPayment(params: PaymentCreateParams): Promise<PaymentCreateResult>
  getPaymentStatus?(partnerReferenceNo: string, referenceNo?: string): Promise<PaymentStatus>
  verifyWebhook?(headers: Headers, rawBody: string, bodyJson: any): Promise<{ valid: boolean; error?: string }>
  normalizeWebhook?(bodyJson: any): { partnerReferenceNo: string; referenceNo?: string; status: PaymentStatus; amount?: number }
}

export function mapTransactionStatusToPaymentStatus(dbStatus: string): PaymentStatus {
  const s = (dbStatus || "").toUpperCase()
  if (s === "SUCCESS" || s === "PAID") return "PAID"
  if (s === "FAILED") return "FAILED"
  if (s === "EXPIRED") return "EXPIRED"
  if (s === "CANCELLED") return "CANCELLED"
  return "PENDING"
}
