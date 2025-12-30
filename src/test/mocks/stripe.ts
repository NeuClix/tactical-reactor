import { vi } from 'vitest'

// Mock Stripe checkout session
export const mockCheckoutSession = {
  id: 'cs_test_123',
  url: 'https://checkout.stripe.com/pay/cs_test_123',
  customer: 'cus_123',
  subscription: 'sub_123',
  metadata: {
    userId: 'user-123',
    tier: 'pro',
  },
}

// Mock Stripe subscription
export const mockStripeSubscription = {
  id: 'sub_123',
  customer: 'cus_123',
  status: 'active',
  current_period_start: Math.floor(Date.now() / 1000),
  current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
  metadata: {
    userId: 'user-123',
  },
  items: {
    data: [
      {
        price: {
          id: 'price_pro_123',
          nickname: 'pro',
        },
      },
    ],
  },
}

// Mock Stripe invoice
export const mockStripeInvoice = {
  id: 'in_123',
  customer: 'cus_123',
  customer_email: 'test@example.com',
  subscription: 'sub_123',
  status: 'paid',
  amount_paid: 9900,
  currency: 'usd',
}

// Mock Stripe webhook event
export function createMockStripeEvent(type: string, data: Record<string, unknown> = {}) {
  return {
    id: `evt_${Date.now()}`,
    type,
    data: {
      object: data,
    },
    created: Math.floor(Date.now() / 1000),
  }
}

// Create mock Stripe client
export function createMockStripeClient() {
  return {
    checkout: {
      sessions: {
        create: vi.fn().mockResolvedValue(mockCheckoutSession),
        retrieve: vi.fn().mockResolvedValue(mockCheckoutSession),
      },
    },
    subscriptions: {
      retrieve: vi.fn().mockResolvedValue(mockStripeSubscription),
      update: vi.fn().mockResolvedValue(mockStripeSubscription),
      cancel: vi.fn().mockResolvedValue({ ...mockStripeSubscription, status: 'canceled' }),
    },
    customers: {
      create: vi.fn().mockResolvedValue({ id: 'cus_123', email: 'test@example.com' }),
      retrieve: vi.fn().mockResolvedValue({ id: 'cus_123', email: 'test@example.com' }),
    },
    webhooks: {
      constructEvent: vi.fn().mockImplementation((payload, signature, secret) => {
        // Parse the payload if it's a string
        const event = typeof payload === 'string' ? JSON.parse(payload) : payload
        return event
      }),
    },
    billingPortal: {
      sessions: {
        create: vi.fn().mockResolvedValue({
          url: 'https://billing.stripe.com/session/test',
        }),
      },
    },
  }
}

// Mock Stripe instance
export const mockStripe = createMockStripeClient()
