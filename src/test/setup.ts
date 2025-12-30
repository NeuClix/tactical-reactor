import '@testing-library/jest-dom'
import { afterEach, beforeAll, afterAll, vi } from 'vitest'

// Mock environment variables
vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co')
vi.stubEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY', 'test-anon-key')
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key')
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_123')
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_123')
vi.stubEnv('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_test_123')
vi.stubEnv('NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID', 'price_starter_123')
vi.stubEnv('NEXT_PUBLIC_STRIPE_PRO_PRICE_ID', 'price_pro_123')
vi.stubEnv('NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID', 'price_agency_123')
vi.stubEnv('ANTHROPIC_API_KEY', 'sk-ant-test-123')
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000')

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Global test lifecycle hooks
beforeAll(() => {
  // Setup before all tests
})

afterAll(() => {
  // Cleanup after all tests
  vi.unstubAllEnvs()
})
