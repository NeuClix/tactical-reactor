import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/checkout/route'

// Mock dependencies
vi.mock('@/lib/supabase-server', () => ({
  createServerComponentClient: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
  },
  PRICING_TIERS: {
    starter: { priceId: 'price_starter123' },
    pro: { priceId: 'price_pro456' },
    agency: { priceId: 'price_agency789' },
  },
}))

vi.mock('@/lib/csrf', () => ({
  verifyCsrfToken: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  rateLimiters: {
    checkout: {
      isAllowed: vi.fn().mockReturnValue({ allowed: true, remaining: 9, resetTime: Date.now() + 60000 }),
    },
  },
  getClientIdentifier: vi.fn().mockReturnValue('user:test-user'),
  getClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  checkRateLimit: vi.fn().mockReturnValue({
    allowed: true,
    headers: {
      'RateLimit-Limit': '10',
      'RateLimit-Remaining': '9',
      'RateLimit-Reset': '1234567890',
    },
  }),
}))

import { createServerComponentClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'
import { verifyCsrfToken } from '@/lib/csrf'
import { checkRateLimit, rateLimiters } from '@/lib/rate-limit'

function createRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

describe('POST /api/checkout', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  const mockSession = {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/pay/cs_test_123',
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Reset rate limiter mock to allow requests
    vi.mocked(checkRateLimit).mockReturnValue({
      allowed: true,
      headers: {
        'RateLimit-Limit': '10',
        'RateLimit-Remaining': '9',
        'RateLimit-Reset': '1234567890',
      },
    })

    // Default mock implementations
    vi.mocked(verifyCsrfToken).mockResolvedValue(true)

    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
    }
    vi.mocked(createServerComponentClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createServerComponentClient>>)

    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue(mockSession as unknown as Awaited<ReturnType<typeof stripe.checkout.sessions.create>>)
  })

  describe('authentication', () => {
    it('returns 401 when user is not authenticated', async () => {
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      }
      vi.mocked(createServerComponentClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createServerComponentClient>>)

      const request = createRequest({
        priceId: 'price_starter123',
        tier: 'starter',
        csrfToken: 'valid-token',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })

  describe('CSRF validation', () => {
    it('returns 403 when CSRF token is invalid', async () => {
      vi.mocked(verifyCsrfToken).mockResolvedValue(false)

      const request = createRequest({
        priceId: 'price_starter123',
        tier: 'starter',
        csrfToken: 'invalid-token',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Invalid request')
    })

    it('passes when CSRF token is valid', async () => {
      vi.mocked(verifyCsrfToken).mockResolvedValue(true)

      const request = createRequest({
        priceId: 'price_starter123',
        tier: 'starter',
        csrfToken: 'valid-token',
      })

      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('rate limiting', () => {
    it('returns 429 when rate limit is exceeded', async () => {
      vi.mocked(checkRateLimit).mockReturnValue({
        allowed: false,
        headers: {
          'RateLimit-Limit': '10',
          'RateLimit-Remaining': '0',
          'RateLimit-Reset': '1234567890',
        },
      })

      const request = createRequest({
        priceId: 'price_starter123',
        tier: 'starter',
        csrfToken: 'valid-token',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toContain('Rate limit exceeded')
    })

    it('includes rate limit headers in response', async () => {
      const request = createRequest({
        priceId: 'price_starter123',
        tier: 'starter',
        csrfToken: 'valid-token',
      })

      const response = await POST(request)

      expect(response.headers.get('RateLimit-Limit')).toBe('10')
      expect(response.headers.get('RateLimit-Remaining')).toBe('9')
    })
  })

  describe('input validation', () => {
    it('returns 400 for invalid price ID format', async () => {
      const request = createRequest({
        priceId: 'invalid_price_id',
        tier: 'starter',
        csrfToken: 'valid-token',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid price ID format')
    })

    it('returns 400 for invalid tier', async () => {
      const request = createRequest({
        priceId: 'price_starter123',
        tier: 'invalid_tier',
        csrfToken: 'valid-token',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid tier')
    })

    it('returns 400 when price ID does not match tier', async () => {
      const request = createRequest({
        priceId: 'price_pro456', // Pro price
        tier: 'starter', // But starter tier
        csrfToken: 'valid-token',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid price/tier combination')
    })

    it('returns 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: 'invalid json{',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid JSON')
    })
  })

  describe('successful checkout', () => {
    it('creates checkout session with correct parameters', async () => {
      const request = createRequest({
        priceId: 'price_starter123',
        tier: 'starter',
        csrfToken: 'valid-token',
      })

      await POST(request)

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith({
        payment_method_types: ['card'],
        line_items: [
          {
            price: 'price_starter123',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: expect.stringContaining('/dashboard?session_id='),
        cancel_url: expect.stringContaining('/pricing'),
        customer_email: 'test@example.com',
        metadata: {
          userId: 'user-123',
          tier: 'starter',
        },
      })
    })

    it('returns session ID and URL on success', async () => {
      const request = createRequest({
        priceId: 'price_starter123',
        tier: 'starter',
        csrfToken: 'valid-token',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.sessionId).toBe('cs_test_123')
      expect(data.url).toBe('https://checkout.stripe.com/pay/cs_test_123')
    })
  })

  describe('error handling', () => {
    it('returns 500 on Stripe API error', async () => {
      vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(new Error('Stripe API error'))

      const request = createRequest({
        priceId: 'price_starter123',
        tier: 'starter',
        csrfToken: 'valid-token',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Failed to create checkout session')
    })

    it('does not expose internal error details', async () => {
      vi.mocked(stripe.checkout.sessions.create).mockRejectedValue(
        new Error('Secret Stripe error with API key sk_live_xxx')
      )

      const request = createRequest({
        priceId: 'price_starter123',
        tier: 'starter',
        csrfToken: 'valid-token',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.error).not.toContain('Secret')
      expect(data.error).not.toContain('sk_live')
    })
  })
})
