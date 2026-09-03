export function getDokuConfig() {
  const env = process.env.DOKU_ENV || "sandbox"
  const baseUrl = process.env.DOKU_BASE_URL || (env === "sandbox" ? "https://api-sandbox.doku.com" : "https://api.doku.com")
  const clientId = process.env.DOKU_CLIENT_ID || "BRN-0272-1788400874210"
  const secretKey = process.env.DOKU_SECRET_KEY || "SK-NyqnVuFhFaNubtfYOEUK"
  const apiKey = process.env.DOKU_API_KEY || "doku_key_sandbox_0804aef38809420ea92a649e3d4b3084"
  let publicKey = process.env.DOKU_PUBLIC_KEY || `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsD/xdQz6vsnX2RAM+lnP4PTGK5/8YA51u/6l+02SDnjSKtzwPCccUZpDHj3nxm+zA30gvi/QcNDdh0PuCdNNkTTa5x7hW+ewqL7BJnaQ2mIbicjkpIa5S8PPF/5ogc6MT3JE2eLVsBKIZVH5L0wqq4GJDQtxRQwnvKrzNrYQqU7nDCx55qwLoN5SPu7JAAn3RvriT7DtRZQV72cx8wgMwpksD1DJcbmk5wraCYeObu/by+GFOoUyff7zyALj3ySy9+BxbzrNb/08uTjGXFdYfRSu3nhQSbqyRbxXuGm7htEBuc2UgmZuNd254nxSElSP3plBeQupcuArKH9ZmPVBQQIDAQAB
-----END PUBLIC KEY-----`
  // Handle escaped newlines from .env (e.g., "-----BEGIN PUBLIC KEY-----\\nMIIBIj...")
  publicKey = publicKey.replace(/\\n/g, "\n")
  let privateKey = process.env.DOKU_PRIVATE_KEY || "" // merchant's private key for asymmetric B2B sign, if not provided we fallback to mock for sandbox
  privateKey = privateKey.replace(/\\n/g, "\n")
  const merchantId = process.env.DOKU_MERCHANT_ID || clientId // fallback to clientId if merchantId not configured
  const terminalId = process.env.DOKU_TERMINAL_ID || "000001"

  if (!clientId || !secretKey) {
    console.warn("[doku] DOKU_CLIENT_ID or DOKU_SECRET_KEY missing — using sandbox defaults, will fallback to mock if real call fails")
  }

  return {
    env: env as "sandbox" | "production",
    baseUrl: baseUrl.replace(/\/$/, ""),
    clientId,
    secretKey,
    apiKey,
    publicKey,
    privateKey,
    merchantId,
    terminalId,
  }
}

// Helper to mask secrets in logs
export function maskSecret(s: string) {
  if (!s) return ""
  if (s.length <= 8) return "****"
  return s.slice(0, 4) + "****" + s.slice(-4)
}
