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

  // Generate asymmetric signature — requires private key
  let signature: string
  if (cfg.privateKey && cfg.privateKey.includes("BEGIN")) {
    try {
      signature = generateAsymmetricSignature(cfg.privateKey, cfg.clientId, timestamp)
    } catch (e) {
      console.error("[doku] asymmetric signature failed", (e as Error).message)
      throw new Error(`DOKU private key invalid: ${(e as Error).message}. Pastikan DOKU_PRIVATE_KEY adalah PKCS#8 unencrypted dan public key sudah di-upload ke DOKU Dashboard.`)
    }
  } else {
    console.error("[doku] DOKU_PRIVATE_KEY not set — cannot get real B2B token")
    throw new Error("DOKU_PRIVATE_KEY belum di-set di server (.env & Vercel). Generate RSA 2048 + upload public.pem ke DOKU Dashboard Sandbox.")
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

    const data = await res.json().catch(async () => ({ text: await res.text() }))

    if (!res.ok || !data.accessToken) {
      console.error("[doku] B2B token failed", res.status, data)
      // Jangan fallback ke mock jika private key ada — beri pesan jelas agar user upload public key
      if (cfg.privateKey) {
        const msg = data.responseMessage || data.error || JSON.stringify(data).slice(0,300)
        throw new Error(`DOKU B2B token gagal ${res.status}: ${msg}. Pastikan public.pem hasil 'openssl rsa -in private.key -pubout' sudah di-upload ke DOKU Dashboard Sandbox untuk client ${cfg.clientId} dan private key di server sinkron.`)
      }
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
    if (cfg.privateKey) throw e
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
