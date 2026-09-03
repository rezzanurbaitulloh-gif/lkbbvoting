import { getDokuConfig } from "./config"
import { generateAsymmetricSignature, generateTimestamp, generateExternalId } from "./signature"

// Simple in-memory token cache (per process)
let cachedToken: { token: string; expiresAt: number } | null = null

export async function getDokuB2BToken(): Promise<string> {
  const cfg = getDokuConfig()
  // Return cached if valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token
  }

  const timestamp = generateTimestamp(true) // "2022-10-07T14:18:39+07:00" — spec says X-TIMESTAMP for B2B includes timezone
  // For B2B, X-TIMESTAMP is ISO8601 with timezone, same as generated
  const endpoint = "/authorization/v1/access-token/b2b"
  const url = `${cfg.baseUrl}${endpoint}`

  // Generate asymmetric signature if privateKey available, else fallback to mock
  let signature: string
  if (cfg.privateKey && cfg.privateKey.includes("BEGIN")) {
    try {
      signature = generateAsymmetricSignature(cfg.privateKey, cfg.clientId, timestamp)
    } catch (e) {
      console.warn("[doku] asymmetric signature failed, fallback to mock token", (e as Error).message)
      return getMockToken()
    }
  } else {
    // No private key — for sandbox we can attempt fallback mock
    // Do not throw, instead try to call DOKU and if it fails fallback
    console.warn("[doku] DOKU_PRIVATE_KEY not set — attempting mock token for sandbox")
    // Try to still call with empty signature? DOKU will reject, so directly return mock
    // But we can try to call anyway with dummy signature to see if sandbox is lenient
    // For now return mock
    return getMockToken()
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CLIENT-KEY": cfg.clientId,
        "X-TIMESTAMP": timestamp,
        "X-SIGNATURE": signature,
      },
      body: JSON.stringify({ grantType: "client_credentials" }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok || !data.accessToken) {
      console.error("[doku] B2B token failed", res.status, data)
      // Fallback to mock for sandbox testing so flow doesn't break
      return getMockToken()
    }

    const token = data.accessToken as string
    const expiresIn = Number(data.expiresIn || 900) // seconds
    cachedToken = {
      token,
      expiresAt: Date.now() + expiresIn * 1000,
    }
    return token
  } catch (e) {
    console.error("[doku] B2B token error", e)
    return getMockToken()
  }
}

function getMockToken(): string {
  // Cache mock token for 15 minutes as well
  if (cachedToken && cachedToken.token.startsWith("mock-") && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }
  const mock = `mock-doku-token-${Date.now()}`
  cachedToken = { token: mock, expiresAt: Date.now() + 850_000 }
  return mock
}

// For testing: allow clearing cache
export function clearDokuTokenCache() {
  cachedToken = null
}
