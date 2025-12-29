/**
 * CSRF (Cross-Site Request Forgery) protection utilities
 * Implements double-submit cookie pattern with session tokens
 */

import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

const CSRF_COOKIE_NAME = '__csrf_token'
const CSRF_HEADER_NAME = 'x-csrf-token'
const TOKEN_LENGTH = 32

/**
 * Generate a random CSRF token
 */
function generateToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex')
}

/**
 * Get or create CSRF token for current session
 */
export async function getOrCreateCsrfToken(): Promise<string> {
  const cookieStore = await cookies()
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value

  // Create new token if doesn't exist
  if (!token) {
    token = generateToken()
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  }

  return token
}

/**
 * Verify CSRF token from request
 * Validates that the token from the request body matches the cookie
 */
export async function verifyCsrfToken(token: string): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value

    // Token must exist and match
    if (!cookieToken || !token) {
      return false
    }

    // Use constant-time comparison to prevent timing attacks
    return timingSafeCompare(token, cookieToken)
  } catch {
    return false
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Clear CSRF token (logout)
 */
export async function clearCsrfToken(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(CSRF_COOKIE_NAME)
}
