import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/webhooks/stripe/route'

// Mock dependencies
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}))

vi.mock('@/lib/supabase-server', () => ({
  createServerComponentClient: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  stripe: {
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}))

import { headers } from 'next/headers'
import { createServerComponentClient } from '@/lib/supabase-server'
import { stripe } from '@/lib/stripe'

function createWebhookRequest(payload: Record<string, unknown>): NextRequest {
  return new NextRequest('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'test_signature_123',
    },
    body: JSON.stringify(payload),
  })
}

describe('POST /api/webhooks/stripe', () => {
  let mockSupabaseFrom: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock headers
    vi.mocked(headers).mockResolvedValue({
      get: vi.fn().mockReturnValue('test_signature_123'),
    } as unknown as Headers)

    // Create chainable mock for Supabase
    mockSupabaseFrom = vi.fn().mockImplementation((table: string) => {
      const chainable = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        upsert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
      return chainable
    })

    const mockSupabase = {
      from: mockSupabaseFrom,
    }

    vi.mocked(createServerComponentClient).mockResolvedValue(mockSupabase as unknown as Awaited<ReturnType<typeof createServerComponentClient>>)
  })

  describe('signature verification', () => {
    it('returns 400 for invalid webhook signature', async () => {
      vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
        throw new Error('Invalid signature')
      })

      const request = createWebhookRequest({ type: 'test.event' })
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid signature')
    })

    it('passes valid signatures', async () => {
      const mockEvent = {
        id: 'evt_123',
        type: 'invoice.payment_succeeded',
        data: {
          object: { id: 'in_123' },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      const request = createWebhookRequest(mockEvent)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('idempotency (duplicate detection)', () => {
    it('returns success for already processed events', async () => {
      const mockEvent = {
        id: 'evt_already_processed',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            metadata: { userId: 'user-123' },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      // Mock that event already exists and was processed
      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: { id: 'we_123', processed: true },
              error: null,
            }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      })

      const request = createWebhookRequest(mockEvent)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(data.duplicate).toBe(true)
    })

    it('records new webhook events', async () => {
      const mockEvent = {
        id: 'evt_new_event',
        type: 'invoice.payment_succeeded',
        data: {
          object: { id: 'in_123' },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      const insertMock = vi.fn().mockResolvedValue({ data: null, error: null })

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnThis(),
            insert: insertMock,
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }
      })

      const request = createWebhookRequest(mockEvent)
      await POST(request)

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'stripe',
          event_id: 'evt_new_event',
          event_type: 'invoice.payment_succeeded',
        })
      )
    })
  })

  describe('customer.subscription.created', () => {
    it('creates subscription record for new subscription', async () => {
      const mockEvent = {
        id: 'evt_sub_created',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            metadata: { userId: 'user-123' },
            items: {
              data: [
                {
                  price: { metadata: { tier: 'pro' } },
                },
              ],
            },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      const upsertMock = vi.fn().mockReturnThis()

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'subscriptions') {
          return {
            upsert: upsertMock,
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return {}
      })

      const request = createWebhookRequest(mockEvent)
      const response = await POST(request)

      expect(response.status).toBe(200)
      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-123',
          stripe_subscription_id: 'sub_123',
          stripe_customer_id: 'cus_123',
          status: 'active',
          plan: 'pro',
        })
      )
    })

    it('handles missing userId gracefully', async () => {
      const mockEvent = {
        id: 'evt_no_user',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            metadata: {}, // No userId
            items: { data: [] },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      const request = createWebhookRequest(mockEvent)
      const response = await POST(request)

      // Should not throw, just skip processing
      expect(response.status).toBe(200)
    })
  })

  describe('customer.subscription.updated', () => {
    it('updates subscription on plan change', async () => {
      const mockEvent = {
        id: 'evt_sub_updated',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_123',
            customer: 'cus_123',
            status: 'active',
            metadata: { userId: 'user-123' },
            items: {
              data: [
                {
                  price: { metadata: { tier: 'agency' } },
                },
              ],
            },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      const upsertMock = vi.fn().mockReturnThis()

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'subscriptions') {
          return {
            upsert: upsertMock,
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return {}
      })

      const request = createWebhookRequest(mockEvent)
      await POST(request)

      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          plan: 'agency',
        })
      )
    })
  })

  describe('customer.subscription.deleted', () => {
    it('marks subscription as canceled', async () => {
      const mockEvent = {
        id: 'evt_sub_deleted',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_123',
            metadata: { userId: 'user-123' },
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      const updateMock = vi.fn().mockReturnThis()

      mockSupabaseFrom.mockImplementation((table: string) => {
        if (table === 'subscriptions') {
          return {
            update: updateMock,
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnThis(),
            insert: vi.fn().mockResolvedValue({ data: null, error: null }),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }
        }
        return {}
      })

      const request = createWebhookRequest(mockEvent)
      await POST(request)

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'canceled',
        })
      )
    })
  })

  describe('invoice events', () => {
    it('handles invoice.payment_succeeded', async () => {
      const mockEvent = {
        id: 'evt_invoice_succeeded',
        type: 'invoice.payment_succeeded',
        data: {
          object: {
            id: 'in_123',
            subscription: 'sub_123',
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      const request = createWebhookRequest(mockEvent)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })

    it('handles invoice.payment_failed', async () => {
      const mockEvent = {
        id: 'evt_invoice_failed',
        type: 'invoice.payment_failed',
        data: {
          object: {
            id: 'in_123',
            subscription: 'sub_123',
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      const request = createWebhookRequest(mockEvent)
      const response = await POST(request)

      expect(response.status).toBe(200)
    })
  })

  describe('error handling', () => {
    it('returns 500 on database error', async () => {
      const mockEvent = {
        id: 'evt_db_error',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: 'sub_123',
            metadata: { userId: 'user-123' },
            items: { data: [] },
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
          },
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      mockSupabaseFrom.mockImplementation(() => {
        throw new Error('Database connection failed')
      })

      const request = createWebhookRequest(mockEvent)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Webhook processing failed')
    })

    it('ignores unhandled event types gracefully', async () => {
      const mockEvent = {
        id: 'evt_unknown',
        type: 'unhandled.event.type',
        data: {
          object: {},
        },
      }

      vi.mocked(stripe.webhooks.constructEvent).mockReturnValue(mockEvent as unknown as ReturnType<typeof stripe.webhooks.constructEvent>)

      const request = createWebhookRequest(mockEvent)
      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })
})
