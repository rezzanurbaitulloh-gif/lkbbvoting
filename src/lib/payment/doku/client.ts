import { getDokuConfig } from "./config"
import { generateDokuQris, queryDokuQris } from "./qris"
import type { PaymentProvider, PaymentCreateParams, PaymentCreateResult, PaymentStatus } from "../provider"
import { verifyDokuWebhookSignature, parseDokuNotification } from "./webhook"

export class DokuPaymentProvider implements PaymentProvider {
  readonly name = "DOKU" as const

  async createPayment(params: PaymentCreateParams): Promise<PaymentCreateResult> {
    const cfg = getDokuConfig()
    const partnerReferenceNo = params.transactionId // use internal UUID as partnerReferenceNo (must be unique, max 64, our UUID is 36, ok)
    // DOKU expects validityPeriod ISO8601, generate 15 min
    const result = await generateDokuQris({
      partnerReferenceNo,
      amount: params.amount,
      merchantId: cfg.merchantId,
      terminalId: cfg.terminalId,
    })

    return {
      provider: "DOKU",
      providerReference: result.referenceNo,
      qrContent: result.qrContent,
      qrUrl: result.qrUrl,
      referenceNo: result.referenceNo,
      expiresAt: result.expiresAt,
      rawResponse: result.raw,
    }
  }

  async getPaymentStatus(partnerReferenceNo: string, referenceNo?: string): Promise<PaymentStatus> {
    const res = await queryDokuQris(partnerReferenceNo, referenceNo)
    const s = res.status.toUpperCase()
    if (s === "PAID" || s === "SUCCESS") return "PAID"
    if (s === "FAILED") return "FAILED"
    if (s === "EXPIRED") return "EXPIRED"
    if (s === "CANCELLED") return "CANCELLED"
    return "PENDING"
  }

  async verifyWebhook(headers: Headers, rawBody: string, bodyJson: any): Promise<{ valid: boolean; error?: string }> {
    return verifyDokuWebhookSignature(headers, rawBody)
  }

  normalizeWebhook(bodyJson: any) {
    const parsed = parseDokuNotification(bodyJson)
    if (!parsed) throw new Error("Invalid DOKU notification")
    let status: PaymentStatus
    if (parsed.status === "PAID") status = "PAID"
    else if (parsed.status === "FAILED") status = "FAILED"
    else if (parsed.status === "EXPIRED") status = "EXPIRED"
    else if (parsed.status === "CANCELLED") status = "CANCELLED"
    else status = "PENDING"
    return {
      partnerReferenceNo: parsed.partnerReferenceNo,
      referenceNo: parsed.referenceNo,
      status,
      amount: parsed.amountNumber,
    }
  }
}

// Factory
export function createDokuProvider(): PaymentProvider {
  return new DokuPaymentProvider()
}
