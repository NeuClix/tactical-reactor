import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { rateLimiters, getClientIdentifier, getClientIp, checkRateLimit } from '@/lib/rate-limit'

describe('RateLimiter', () => {
  beforeEach(() => {
    // Reset all rate limiters before each test
    Object.values(rateLimiters).forEach((limiter) => {
      limiter.resetAll()
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('isAllowed', () => {
    it('allows first request within limit', () => {
      const result = rateLimiters.generate.isAllowed('test-user')
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(19) // 20 max - 1 used
    })

    it('tracks requests correctly', () => {
      const identifier = 'test-user-2'

      // Make 5 requests
      for (let i = 0; i < 5; i++) {
        rateLimiters.generate.isAllowed(identifier)
      }

      const result = rateLimiters.generate.isAllowed(identifier)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(14) // 20 max - 6 used
    })

    it('blocks requests when limit exceeded', () => {
      const identifier = 'test-user-3'

      // Exhaust the limit (20 requests for generate)
      for (let i = 0; i < 20; i++) {
        rateLimiters.generate.isAllowed(identifier)
      }

      const result = rateLimiters.generate.isAllowed(identifier)
      expect(result.allowed).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('resets after window expires', () => {
      vi.useFakeTimers()
      const identifier = 'test-user-4'

      // Exhaust the limit
      for (let i = 0; i < 20; i++) {
        rateLimiters.generate.isAllowed(identifier)
      }

      // Verify blocked
      expect(rateLimiters.generate.isAllowed(identifier).allowed).toBe(false)

      // Advance time past the window (60 seconds + 1ms)
      vi.advanceTimersByTime(60001)

      // Should be allowed again
      const result = rateLimiters.generate.isAllowed(identifier)
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(19)
    })

    it('provides correct reset time', () => {
      vi.useFakeTimers()
      const now = Date.now()
      vi.setSystemTime(now)

      const identifier = 'test-user-5'
      const result = rateLimiters.generate.isAllowed(identifier)

      // Reset time should be ~60 seconds from now
      expect(result.resetTime).toBeGreaterThan(now)
      expect(result.resetTime).toBeLessThanOrEqual(now + 60000)
    })

    it('handles multiple identifiers independently', () => {
      const user1 = 'user-1'
      const user2 = 'user-2'

      // Exhaust limit for user1
      for (let i = 0; i < 20; i++) {
        rateLimiters.generate.isAllowed(user1)
      }

      // User1 should be blocked
      expect(rateLimiters.generate.isAllowed(user1).allowed).toBe(false)

      // User2 should still be allowed
      expect(rateLimiters.generate.isAllowed(user2).allowed).toBe(true)
    })
  })

  describe('reset', () => {
    it('resets limit for specific identifier', () => {
      const identifier = 'reset-test-user'

      // Make some requests
      for (let i = 0; i < 15; i++) {
        rateLimiters.generate.isAllowed(identifier)
      }

      // Verify count is tracked
      expect(rateLimiters.generate.isAllowed(identifier).remaining).toBe(4)

      // Reset the identifier
      rateLimiters.generate.reset(identifier)

      // Should be fresh start
      const result = rateLimiters.generate.isAllowed(identifier)
      expect(result.remaining).toBe(19) // Full limit - 1
    })
  })

  describe('resetAll', () => {
    it('resets limits for all identifiers', () => {
      const user1 = 'reset-all-user-1'
      const user2 = 'reset-all-user-2'

      // Make requests for both users
      for (let i = 0; i < 10; i++) {
        rateLimiters.generate.isAllowed(user1)
        rateLimiters.generate.isAllowed(user2)
      }

      // Reset all
      rateLimiters.generate.resetAll()

      // Both should have fresh limits
      expect(rateLimiters.generate.isAllowed(user1).remaining).toBe(19)
      expect(rateLimiters.generate.isAllowed(user2).remaining).toBe(19)
    })
  })

  describe('different rate limit configurations', () => {
    it('generate limiter allows 20 requests per minute', () => {
      const identifier = 'config-test-generate'

      for (let i = 0; i < 20; i++) {
        expect(rateLimiters.generate.isAllowed(identifier).allowed).toBe(true)
      }
      expect(rateLimiters.generate.isAllowed(identifier).allowed).toBe(false)
    })

    it('checkout limiter allows 10 requests per minute', () => {
      const identifier = 'config-test-checkout'

      for (let i = 0; i < 10; i++) {
        expect(rateLimiters.checkout.isAllowed(identifier).allowed).toBe(true)
      }
      expect(rateLimiters.checkout.isAllowed(identifier).allowed).toBe(false)
    })

    it('login limiter allows 5 requests per minute', () => {
      const identifier = 'config-test-login'

      for (let i = 0; i < 5; i++) {
        expect(rateLimiters.login.isAllowed(identifier).allowed).toBe(true)
      }
      expect(rateLimiters.login.isAllowed(identifier).allowed).toBe(false)
    })

    it('signup limiter allows 3 requests per minute', () => {
      const identifier = 'config-test-signup'

      for (let i = 0; i < 3; i++) {
        expect(rateLimiters.signup.isAllowed(identifier).allowed).toBe(true)
      }
      expect(rateLimiters.signup.isAllowed(identifier).allowed).toBe(false)
    })

    it('webhook limiter allows 100 requests per minute', () => {
      const identifier = 'config-test-webhook'

      for (let i = 0; i < 100; i++) {
        expect(rateLimiters.webhook.isAllowed(identifier).allowed).toBe(true)
      }
      expect(rateLimiters.webhook.isAllowed(identifier).allowed).toBe(false)
    })
  })
})

describe('getClientIdentifier', () => {
  it('returns user-prefixed identifier when userId is provided', () => {
    const result = getClientIdentifier('user-123', '192.168.1.1')
    expect(result).toBe('user:user-123')
  })

  it('returns ip-prefixed identifier when only IP is provided', () => {
    const result = getClientIdentifier(null, '192.168.1.1')
    expect(result).toBe('ip:192.168.1.1')
  })

  it('prefers userId over IP address', () => {
    const result = getClientIdentifier('user-456', '10.0.0.1')
    expect(result).toBe('user:user-456')
  })

  it('returns unknown when neither userId nor IP is provided', () => {
    const result = getClientIdentifier(null, null)
    expect(result).toBe('unknown')
  })

  it('handles empty string userId as falsy', () => {
    const result = getClientIdentifier('', '192.168.1.1')
    expect(result).toBe('ip:192.168.1.1')
  })

  it('handles empty string IP as falsy', () => {
    const result = getClientIdentifier(null, '')
    expect(result).toBe('unknown')
  })
})

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.195',
    })

    const result = getClientIp(headers)
    expect(result).toBe('203.0.113.195')
  })

  it('takes first IP from x-forwarded-for chain', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.195, 70.41.3.18, 150.172.238.178',
    })

    const result = getClientIp(headers)
    expect(result).toBe('203.0.113.195')
  })

  it('trims whitespace from forwarded IP', () => {
    const headers = new Headers({
      'x-forwarded-for': '  203.0.113.195  , 70.41.3.18',
    })

    const result = getClientIp(headers)
    expect(result).toBe('203.0.113.195')
  })

  it('falls back to x-real-ip when x-forwarded-for is not present', () => {
    const headers = new Headers({
      'x-real-ip': '10.0.0.50',
    })

    const result = getClientIp(headers)
    expect(result).toBe('10.0.0.50')
  })

  it('prefers x-forwarded-for over x-real-ip', () => {
    const headers = new Headers({
      'x-forwarded-for': '203.0.113.195',
      'x-real-ip': '10.0.0.50',
    })

    const result = getClientIp(headers)
    expect(result).toBe('203.0.113.195')
  })

  it('returns localhost when no IP headers are present', () => {
    const headers = new Headers()

    const result = getClientIp(headers)
    expect(result).toBe('127.0.0.1')
  })

  it('handles IPv6 addresses', () => {
    const headers = new Headers({
      'x-forwarded-for': '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    })

    const result = getClientIp(headers)
    expect(result).toBe('2001:0db8:85a3:0000:0000:8a2e:0370:7334')
  })
})

describe('checkRateLimit', () => {
  beforeEach(() => {
    Object.values(rateLimiters).forEach((limiter) => {
      limiter.resetAll()
    })
  })

  it('returns allowed: true when within limit', () => {
    const result = checkRateLimit('check-test-user', rateLimiters.generate)

    expect(result.allowed).toBe(true)
    expect(result.headers['RateLimit-Limit']).toBe('20')
    expect(result.headers['RateLimit-Remaining']).toBe('19')
  })

  it('returns allowed: false when limit exceeded', () => {
    const identifier = 'check-test-user-exceeded'

    // Exhaust the limit
    for (let i = 0; i < 20; i++) {
      rateLimiters.generate.isAllowed(identifier)
    }

    const result = checkRateLimit(identifier, rateLimiters.generate)

    expect(result.allowed).toBe(false)
    expect(result.headers['RateLimit-Remaining']).toBe('0')
  })

  it('includes rate limit headers', () => {
    const result = checkRateLimit('header-test-user', rateLimiters.generate)

    expect(result.headers).toHaveProperty('RateLimit-Limit')
    expect(result.headers).toHaveProperty('RateLimit-Remaining')
    expect(result.headers).toHaveProperty('RateLimit-Reset')
  })

  it('reset time is in seconds (Unix timestamp)', () => {
    const result = checkRateLimit('reset-time-test', rateLimiters.generate)

    const resetTime = parseInt(result.headers['RateLimit-Reset'], 10)
    const nowSeconds = Math.ceil(Date.now() / 1000)

    // Reset time should be in the future (within ~60 seconds)
    expect(resetTime).toBeGreaterThan(nowSeconds)
    expect(resetTime).toBeLessThanOrEqual(nowSeconds + 60)
  })

  it('remaining never goes below 0', () => {
    const identifier = 'no-negative-remaining'

    // Exceed the limit significantly
    for (let i = 0; i < 25; i++) {
      rateLimiters.generate.isAllowed(identifier)
    }

    const result = checkRateLimit(identifier, rateLimiters.generate)

    expect(parseInt(result.headers['RateLimit-Remaining'], 10)).toBe(0)
  })

  it('works with different limiters', () => {
    const loginResult = checkRateLimit('login-user', rateLimiters.login)
    const signupResult = checkRateLimit('signup-user', rateLimiters.signup)

    expect(loginResult.headers['RateLimit-Limit']).toBe('5')
    expect(signupResult.headers['RateLimit-Limit']).toBe('3')
  })
})
