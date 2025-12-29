/**
 * Rate limiting implementation
 * Protects API endpoints from abuse and DoS attacks
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number // Time window in milliseconds
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

/**
 * In-memory rate limiter for development
 * For production, use Upstash Redis or similar
 */
class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map()
  private config: RateLimitConfig

  constructor(config: RateLimitConfig = { maxRequests: 10, windowMs: 60000 }) {
    this.config = config

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  /**
   * Check if request should be allowed
   * Returns true if allowed, false if rate limited
   */
  isAllowed(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const entry = this.store.get(identifier)

    // Create new entry if doesn't exist or window has expired
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + this.config.windowMs,
      }
      this.store.set(identifier, newEntry)

      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newEntry.resetTime,
      }
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      }
    }

    // Increment and allow
    entry.count++

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    }
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()

    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Reset limit for specific identifier
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }

  /**
   * Reset all limits
   */
  resetAll(): void {
    this.store.clear()
  }
}

/**
 * Create rate limiters for different endpoints
 */
export const rateLimiters = {
  // /api/generate - 20 requests per minute per user
  generate: new RateLimiter({ maxRequests: 20, windowMs: 60000 }),

  // /api/checkout - 10 requests per minute per user
  checkout: new RateLimiter({ maxRequests: 10, windowMs: 60000 }),

  // /auth/login - 5 requests per minute per IP
  login: new RateLimiter({ maxRequests: 5, windowMs: 60000 }),

  // /auth/signup - 3 requests per minute per IP
  signup: new RateLimiter({ maxRequests: 3, windowMs: 60000 }),

  // /api/webhooks/* - 100 requests per minute per IP
  webhook: new RateLimiter({ maxRequests: 100, windowMs: 60000 }),
}

/**
 * Get client identifier from request
 * Uses user ID if authenticated, falls back to IP address
 */
export function getClientIdentifier(
  userId: string | null,
  ipAddress: string | null
): string {
  if (userId) {
    return `user:${userId}`
  }

  if (ipAddress) {
    return `ip:${ipAddress}`
  }

  return 'unknown'
}

/**
 * Extract IP address from request headers
 */
export function getClientIp(headers: Headers): string {
  // Check for X-Forwarded-For first (from proxies)
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    // Take the first IP if multiple are listed
    return forwarded.split(',')[0].trim()
  }

  // Check for X-Real-IP (from nginx)
  const realIp = headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to localhost for development
  return '127.0.0.1'
}

/**
 * Check rate limit and return response if exceeded
 */
export function checkRateLimit(
  identifier: string,
  limiter: RateLimiter,
  headers?: Headers
): { allowed: boolean; headers: Record<string, string> } {
  const result = limiter.isAllowed(identifier)

  const responseHeaders = {
    'RateLimit-Limit': limiter['config'].maxRequests.toString(),
    'RateLimit-Remaining': Math.max(0, result.remaining).toString(),
    'RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  }

  return {
    allowed: result.allowed,
    headers: responseHeaders,
  }
}
