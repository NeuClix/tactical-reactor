import { vi } from 'vitest'

// Mock user for authenticated requests
export const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
}

// Mock subscription data
export const mockSubscription = {
  id: 'sub-123',
  user_id: 'user-123',
  stripe_customer_id: 'cus_123',
  stripe_subscription_id: 'sub_stripe_123',
  status: 'active' as const,
  plan: 'pro' as const,
  current_period_start: '2024-01-01T00:00:00Z',
  current_period_end: '2024-02-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

// Mock generation history
export const mockGenerationHistory = [
  {
    id: 'gen-1',
    user_id: 'user-123',
    prompt: 'Test prompt',
    response: 'Test response',
    tokens_used: 100,
    created_at: new Date().toISOString(),
  },
]

// Create mock Supabase client
export function createMockSupabaseClient(overrides: {
  user?: typeof mockUser | null
  subscription?: typeof mockSubscription | null
  generationHistory?: typeof mockGenerationHistory
} = {}) {
  const user = overrides.user === undefined ? mockUser : overrides.user
  const subscription = overrides.subscription === undefined ? mockSubscription : overrides.subscription
  const generationHistory = overrides.generationHistory ?? mockGenerationHistory

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: user ? { user } : null },
        error: null,
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user, session: { user } },
        error: null,
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user, session: { user } },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => {
        if (table === 'subscriptions') {
          return Promise.resolve({ data: subscription, error: null })
        }
        return Promise.resolve({ data: null, error: null })
      }),
      then: vi.fn().mockImplementation((callback) => {
        if (table === 'generation_history') {
          return Promise.resolve(callback({ data: generationHistory, error: null }))
        }
        return Promise.resolve(callback({ data: [], error: null }))
      }),
    })),
  }
}

// Mock for createServerComponentClient
export const mockCreateServerComponentClient = vi.fn(() => createMockSupabaseClient())

// Mock for createClient (browser)
export const mockCreateClient = vi.fn(() => createMockSupabaseClient())
