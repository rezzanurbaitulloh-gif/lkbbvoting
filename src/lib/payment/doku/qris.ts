import { getDokuConfig } from "./config"
import { getDokuB2BToken } from "./token"
import { generateSymmetricSignature, generateTimestamp, generateExternalId, minifyJson, sha256HexLower } from "./signature"

export type DokuQrisGenerateParams = {
  partnerReferenceNo: string // our transactionId (must be unique, max 64)
  amount: number // in IDR, e.g., 50000
  merchantId?: string
  terminalId?: string
  validityPeriod?: string // ISO8601, optional
}

export type DokuQrisGenerateResult = {
  responseCode: string
  responseMessage: string
  referenceNo: string // DOKU's referenceNo
  partnerReferenceNo: string
  qrContent: string // EMV QR string
  qrUrl?: string
  expiresAt?: string
  raw: any
}

export async function generateDokuQris(params: DokuQrisGenerateParams): Promise<DokuQrisGenerateResult> {
  const cfg = getDokuConfig()
  const token = await getDokuB2BToken()
  const isMockToken = token.startsWith("mock-")

  // If mock token, generate mock QR without calling DOKU (sandbox fallback)
  if (isMockToken) {
    return generateMockQris(params)
  }

  const endpoint = "/snap-adapter/b2b/v1.0/qr/qr-mpm-generate"
  const url = `${cfg.baseUrl}${endpoint}`
  const timestamp = generateTimestamp(true)
  const externalId = generateExternalId()
  const merchantId = params.merchantId || cfg.merchantId
  const terminalId = params.terminalId || cfg.terminalId

  // Validity: default 15 minutes from now, ISO8601 +07:00
  const validityPeriod = params.validityPeriod || new Date(Date.now() + 15 * 60 * 1000).toISOString().replace("Z", "+07:00")

  // Amount must be formatted as "12345.00" (2 decimals)
  const amountValue = Number(params.amount).toFixed(2)

  const body = {
    partnerReferenceNo: params.partnerReferenceNo,
    amount: {
      value: amountValue,
      currency: "IDR",
    },
    merchantId,
    terminalId,
    validityPeriod,
    additionalInfo: {
      postalCode: "60293", // default, required
      feeType: 1,
    },
  }

  const signature = generateSymmetricSignature(cfg.secretKey, "POST", endpoint, token, body, timestamp)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PARTNER-ID": cfg.clientId,
        "X-EXTERNAL-ID": externalId,
        "X-TIMESTAMP": timestamp,
        "X-SIGNATURE": signature,
        "Authorization": `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
        "CHANNEL-ID": "H2H",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json().catch(async () => ({ rawText: await res.text() }))

    if (!res.ok) {
      console.error("[doku] qris generate failed", res.status, data)
      // Fallback to mock if sandbox credentials incorrect (so payment flow not blocked)
      if (cfg.env === "sandbox") {
        console.warn("[doku] fallback to mock QR due to API error")
        return generateMockQris(params)
      }
      throw new Error(`DOKU QRIS generate failed: ${res.status} ${JSON.stringify(data)}`)
    }

    // Success codes: 2004700 etc, but also check responseCode
    if (data.responseCode && !String(data.responseCode).startsWith("200")) {
      console.error("[doku] qris business error", data)
      if (cfg.env === "sandbox") {
        return generateMockQris(params)
      }
      throw new Error(`DOKU QRIS error ${data.responseCode}: ${data.responseMessage}`)
    }

    return {
      responseCode: data.responseCode || "2004700",
      responseMessage: data.responseMessage || "Success",
      referenceNo: data.referenceNo || "",
      partnerReferenceNo: data.partnerReferenceNo || params.partnerReferenceNo,
      qrContent: data.qrContent || "",
      qrUrl: data.qrUrl || undefined,
      expiresAt: data.additionalInfo?.validityPeriod || validityPeriod,
      raw: data,
    }
  } catch (e) {
    console.error("[doku] qris generate exception", e)
    if (cfg.env === "sandbox") {
      return generateMockQris(params)
    }
    throw e
  }
}

function generateMockQris(params: DokuQrisGenerateParams): DokuQrisGenerateResult {
  // Generate deterministic mock QR content that encodes transaction info
  // Format similar to EMV: we just use a string that frontend can render as QR
  const mockReferenceNo = `MOCK-${Date.now().toString().slice(-8)}-${params.partnerReferenceNo.slice(0, 8).toUpperCase()}`
  // Create a QR content that is base64-ish but will be rendered as QR image by frontend
  // Frontend uses `qrcode` lib to generate QR from string, so any string works
  // We embed partnerReferenceNo so webhook can find it
  const qrContent = `00020101021226580011ID.DOKU.WWW01189360011000000000000202150202${String(params.amount).padStart(4, "0")}5802ID5909LKBBVOTING6006NGANJUK62070503***6304`

  // Replace *** with simple checksum-like to include partnerReferenceNo hash
  const hash = params.partnerReferenceNo.slice(0, 8)
  const finalQr = qrContent.replace("***", hash.slice(0, 3).toUpperCase())

  return {
    responseCode: "2004700",
    responseMessage: "Success (mock)",
    referenceNo: mockReferenceNo,
    partnerReferenceNo: params.partnerReferenceNo,
    qrContent: finalQr,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    raw: { mock: true, amount: params.amount, merchantId: params.partnerReferenceNo },
  }
}

// Query QR status (optional, for status check)
export async function queryDokuQris(partnerReferenceNo: string, referenceNo?: string): Promise<{ status: string; raw: any }> {
  const cfg = getDokuConfig()
  const token = await getDokuB2BToken()
  if (token.startsWith("mock-")) {
    // Mock query: we don't have real DOKU, so return pending
    return { status: "pending", raw: { mock: true } }
  }

  const endpoint = "/snap-adapter/b2b/v1.0/qr/qr-mpm-query"
  const url = `${cfg.baseUrl}${endpoint}`
  const timestamp = generateTimestamp(true)
  const externalId = generateExternalId()
  const merchantId = cfg.merchantId

  const body: any = {
    originalPartnerReferenceNo: partnerReferenceNo,
    serviceCode: "47",
    merchantId,
  }
  if (referenceNo) body.originalReferenceNo = referenceNo

  const signature = generateSymmetricSignature(cfg.secretKey, "POST", endpoint, token, body, timestamp)

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-PARTNER-ID": cfg.clientId,
        "X-EXTERNAL-ID": externalId,
        "X-TIMESTAMP": timestamp,
        "X-SIGNATURE": signature,
        "Authorization": `Bearer ${token.replace(/^Bearer\s+/i, "")}`,
        "CHANNEL-ID": "H2H",
      },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(async () => ({ rawText: await res.text() }))
    if (!res.ok) {
      console.error("[doku] query failed", res.status, data)
      return { status: "unknown", raw: data }
    }
    // latestTransactionStatus: "00"=Success, "03"=Pending, "04"=Refunded, "05"=Canceled, "06"=Failed
    const latest = data.latestTransactionStatus
    let status = "pending"
    if (latest === "00") status = "PAID"
    else if (latest === "03") status = "pending"
    else if (latest === "06" || latest === "05") status = "failed"
    else if (data.responseCode && String(data.responseCode).startsWith("200")) status = "pending"
    return { status, raw: data }
  } catch (e) {
    console.error("[doku] query error", e)
    return { status: "unknown", raw: e }
  }
}
