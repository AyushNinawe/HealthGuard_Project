/**
 * JWT utility functions
 */

/** Decode JWT payload without verification (supports real JWTs and demo tokens) */
export function decodeJwtPayload(token) {
  try {
    const part = token.split('.')[1]
    // Handle both standard base64url (real JWT) and plain base64 (demo token)
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json)
  } catch {
    return null
  }
}

/** Returns true if the token is expired or invalid */
export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token)
  if (!payload || !payload.exp) return false
  return payload.exp * 1000 < Date.now()
}
