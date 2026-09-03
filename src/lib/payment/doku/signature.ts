import crypto from "crypto"

/**
 * DOKU SNAP signature helpers
 * - Asymmetric (B2B token): SHA256withRSA, stringToSign = clientId + "|" + timestamp
 * - Symmetric (transactional & webhook): HMAC_SHA512, stringToSign = HTTPMethod + ":" + endpointUrl + ":" + accessToken + ":" + lowercase(hex(SHA256(minify(body)))) + ":" + timestamp
 */

// minify JSON body: JSON.stringify without spaces, as produced by JSON.stringify (which is minified) — but ensure deterministic
export function minifyJson(body: any): string {
  if (!body || (typeof body === "object" && Object.keys(body).length === 0)) return ""
  // Use JSON.stringify directly — it produces minified form
  // For DOKU spec, "minify(RequestBody)" means remove whitespace line breaks — JSON.stringify does that
  return JSON.stringify(body)
}

export function sha256HexLower(minified: string): string {
  if (!minified) {
    // For empty body (e.g., GET), DOKU expects hex of empty string's SHA256?
    // spec says hexEncode(SHA256(minify(RequestBody))) — for empty, it's SHA256("")
    const hash = crypto.createHash("sha256").update("", "utf8").digest("hex")
    return hash.toLowerCase()
  }
  const hash = crypto.createHash("sha256").update(minified, "utf8").digest("hex")
  return hash.toLowerCase()
}

// Asymmetric signature for B2B token: sign with private key
export function generateAsymmetricSignature(privateKeyPem: string, clientId: string, timestamp: string): string {
  const stringToSign = `${clientId}|${timestamp}`
  // privateKeyPem should be PKCS#8 format. If it's encrypted or PKCS1, Node handles.
  // We try to create private key, if fails fallback to HMAC mock
  try {
    const signer = crypto.createSign("SHA256")
    signer.update(stringToSign, "utf8")
    signer.end()
    const signature = signer.sign(privateKeyPem, "base64")
    return signature
  } catch (e) {
    // Fallback: if no private key, throw to let caller handle mock
    throw new Error(`Asymmetric sign failed: ${(e as Error).message}`)
  }
}

// Symmetric signature for transactional APIs and webhook verification
export function generateSymmetricSignature(
  secretKey: string,
  httpMethod: string,
  endpointUrl: string, // e.g., /snap-adapter/b2b/v1.0/qr/qr-mpm-generate
  accessToken: string, // without Bearer
  requestBody: any,
  timestamp: string
): string {
  const minified = minifyJson(requestBody)
  const hashHex = sha256HexLower(minified)
  const token = accessToken.replace(/^Bearer\s+/i, "").trim()
  const stringToSign = `${httpMethod}:${endpointUrl}:${token}:${hashHex}:${timestamp}`
  const hmac = crypto.createHmac("sha512", secretKey)
  hmac.update(stringToSign, "utf8")
  return hmac.digest("base64")
}

// For webhook verification: same symmetric, but endpoint is merchant notification path
export function verifySymmetricSignature(
  secretKey: string,
  httpMethod: string,
  endpointUrl: string,
  accessToken: string,
  rawBody: string, // raw JSON string as received (should be minified? DOKU uses minify(RequestBody))
  timestamp: string,
  receivedSignature: string
): boolean {
  // DOKU spec: Lowercase(HexEncode(SHA256(minify(RequestBody))))
  // rawBody may contain whitespace — we should minify by parsing and re-stringifying if possible
  let minified: string
  try {
    const parsed = JSON.parse(rawBody)
    minified = JSON.stringify(parsed)
  } catch {
    minified = rawBody.trim()
  }
  const hashHex = sha256HexLower(minified)
  const token = accessToken.replace(/^Bearer\s+/i, "").trim()
  const stringToSign = `${httpMethod}:${endpointUrl}:${token}:${hashHex}:${timestamp}`
  const expected = crypto.createHmac("sha512", secretKey).update(stringToSign, "utf8").digest("base64")
  // Use timingSafeEqual if lengths equal
  try {
    const a = Buffer.from(expected)
    const b = Buffer.from(receivedSignature)
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return expected === receivedSignature
  }
}

// Helper to generate ISO8601 timestamp for DOKU
// SNAP expects "YYYY-MM-DDTHH:mm:ss+07:00" or "YYYY-MM-DDTHH:mm:ssZ" depending on endpoint
// B2B token docs say X-TIMESTAMP is "2022-10-07T14:18:39+07:00" (with timezone) for token,
// and for transactional: "X-TIMESTAMP" with format YYYY-MM-DDTHH:mm:ss+07:00
export function generateTimestamp(withTimezone = true): string {
  const now = new Date()
  if (!withTimezone) {
    // UTC Zulu: YYYY-MM-DDTHH:mm:ssZ (for some endpoints)
    return now.toISOString().replace(/\.\d+Z$/, "Z")
  }
  // For Indonesia WIB: +07:00
  // We generate offset +07:00 explicitly
  const pad = (n: number) => n.toString().padStart(2, "0")
  const year = now.getFullYear()
  const month = pad(now.getMonth() + 1)
  const day = pad(now.getDate())
  const hour = pad(now.getHours())
  const min = pad(now.getMinutes())
  const sec = pad(now.getSeconds())
  // Use local time with +07:00 (WIB)
  // If we want UTC+7, we need to adjust from UTC
  // Simpler: use Intl to get WIB time
  // Alternative: Use Date with timezone offset
  // We'll construct from UTC then add 7 hours
  const utc = new Date(now.getTime() + 7 * 60 * 60 * 1000)
  const y = utc.getUTCFullYear()
  const m = pad(utc.getUTCMonth() + 1)
  const d = pad(utc.getUTCDate())
  const h = pad(utc.getUTCHours())
  const mi = pad(utc.getUTCMinutes())
  const s = pad(utc.getUTCSeconds())
  return `${y}-${m}-${d}T${h}:${mi}:${s}+07:00`
}

export function generateExternalId(): string {
  // Numeric string, unique per day — use timestamp + random, numeric only
  const now = Date.now().toString().slice(-10) // last 10 digits
  const rand = Math.floor(Math.random() * 900000 + 100000).toString() // 6 digits
  return now + rand // 16 digits numeric
}
