import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the next/headers module
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}))

// Import after mocking
import { cookies } from 'next/headers'
import { getOrCreateCsrfToken, verifyCsrfToken, clearCsrfToken } from '@/lib/csrf'

describe('CSRF Protection', () => {
  let mockCookieStore: {
    get: ReturnType<typeof vi.fn>
    set: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()

    // Create mock cookie store
    mockCookieStore = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    }

    // Mock cookies() to return our mock store
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>)
  })

  describe('getOrCreateCsrfToken', () => {
    it('returns existing token from cookie', async () => {
      const existingToken = 'existing-csrf-token-abc123'
      mockCookieStore.get.mockReturnValue({ value: existingToken })

      const token = await getOrCreateCsrfToken()

      expect(token).toBe(existingToken)
      expect(mockCookieStore.get).toHaveBeenCalledWith('__csrf_token')
      expect(mockCookieStore.set).not.toHaveBeenCalled()
    })

    it('creates new token when none exists', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      const token = await getOrCreateCsrfToken()

      // Token should be a 64 character hex string (32 bytes = 64 hex chars)
      expect(token).toMatch(/^[a-f0-9]{64}$/)
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        '__csrf_token',
        token,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          path: '/',
        })
      )
    })

    it('sets cookie with correct security options', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      await getOrCreateCsrfToken()

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        '__csrf_token',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          path: '/',
        })
      )
    })

    it('generates unique tokens on each creation', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      const token1 = await getOrCreateCsrfToken()

      // Reset mock to simulate new session
      vi.clearAllMocks()
      mockCookieStore.get.mockReturnValue(undefined)

      const token2 = await getOrCreateCsrfToken()

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyCsrfToken', () => {
    it('returns true when tokens match', async () => {
      const validToken = 'valid-csrf-token-xyz789'
      mockCookieStore.get.mockReturnValue({ value: validToken })

      const result = await verifyCsrfToken(validToken)

      expect(result).toBe(true)
    })

    it('returns false when tokens do not match', async () => {
      const cookieToken = 'cookie-token-abc'
      const requestToken = 'different-token-xyz'
      mockCookieStore.get.mockReturnValue({ value: cookieToken })

      const result = await verifyCsrfToken(requestToken)

      expect(result).toBe(false)
    })

    it('returns false when cookie token is missing', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      const result = await verifyCsrfToken('some-token')

      expect(result).toBe(false)
    })

    it('returns false when request token is empty', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'valid-token' })

      const result = await verifyCsrfToken('')

      expect(result).toBe(false)
    })

    it('returns false when cookie value is null', async () => {
      mockCookieStore.get.mockReturnValue({ value: null })

      const result = await verifyCsrfToken('some-token')

      expect(result).toBe(false)
    })

    it('handles errors gracefully', async () => {
      mockCookieStore.get.mockImplementation(() => {
        throw new Error('Cookie access error')
      })

      const result = await verifyCsrfToken('some-token')

      expect(result).toBe(false)
    })

    it('rejects tokens of different lengths', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'short' })

      const result = await verifyCsrfToken('much-longer-token-here')

      expect(result).toBe(false)
    })

    it('uses constant-time comparison (timing attack prevention)', async () => {
      // This test verifies the comparison happens even with different length tokens
      // The actual timing-safe comparison is difficult to test directly,
      // but we verify the function returns false for any mismatch
      const cookieToken = 'a'.repeat(64)
      const similarToken = 'a'.repeat(63) + 'b'
      mockCookieStore.get.mockReturnValue({ value: cookieToken })

      const result = await verifyCsrfToken(similarToken)

      expect(result).toBe(false)
    })
  })

  describe('clearCsrfToken', () => {
    it('deletes the CSRF cookie', async () => {
      await clearCsrfToken()

      expect(mockCookieStore.delete).toHaveBeenCalledWith('__csrf_token')
    })

    it('calls cookies() to get the store', async () => {
      await clearCsrfToken()

      expect(cookies).toHaveBeenCalled()
    })
  })

  describe('token format', () => {
    it('generates tokens of correct length (64 hex characters)', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      const token = await getOrCreateCsrfToken()

      expect(token).toHaveLength(64)
    })

    it('generates tokens with only hexadecimal characters', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      const token = await getOrCreateCsrfToken()

      expect(token).toMatch(/^[a-f0-9]+$/)
    })
  })

  describe('security properties', () => {
    it('cookie is httpOnly to prevent XSS access', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      await getOrCreateCsrfToken()

      const setCall = mockCookieStore.set.mock.calls[0]
      expect(setCall[2].httpOnly).toBe(true)
    })

    it('cookie uses strict sameSite to prevent CSRF', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      await getOrCreateCsrfToken()

      const setCall = mockCookieStore.set.mock.calls[0]
      expect(setCall[2].sameSite).toBe('strict')
    })

    it('cookie path is set to root', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      await getOrCreateCsrfToken()

      const setCall = mockCookieStore.set.mock.calls[0]
      expect(setCall[2].path).toBe('/')
    })

    it('cookie has 7 day expiration', async () => {
      mockCookieStore.get.mockReturnValue(undefined)

      await getOrCreateCsrfToken()

      const setCall = mockCookieStore.set.mock.calls[0]
      expect(setCall[2].maxAge).toBe(604800) // 7 days in seconds
    })
  })
})

// Test the timing-safe comparison independently
describe('timingSafeCompare (via verifyCsrfToken behavior)', () => {
  let mockCookieStore: {
    get: ReturnType<typeof vi.fn>
    set: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockCookieStore = {
      get: vi.fn(),
      set: vi.fn(),
      delete: vi.fn(),
    }
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as unknown as Awaited<ReturnType<typeof cookies>>)
  })

  it('exact match returns true', async () => {
    const token = 'abc123def456'
    mockCookieStore.get.mockReturnValue({ value: token })

    expect(await verifyCsrfToken(token)).toBe(true)
  })

  it('single character difference returns false', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'abc123def456' })

    expect(await verifyCsrfToken('abc123def457')).toBe(false)
  })

  it('completely different strings return false', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'abc123' })

    expect(await verifyCsrfToken('xyz789')).toBe(false)
  })

  it('empty strings with cookie value returns false', async () => {
    mockCookieStore.get.mockReturnValue({ value: '' })

    expect(await verifyCsrfToken('')).toBe(false)
  })

  it('handles unicode characters', async () => {
    const unicodeToken = 'token-with-unicode-🔐'
    mockCookieStore.get.mockReturnValue({ value: unicodeToken })

    expect(await verifyCsrfToken(unicodeToken)).toBe(true)
  })
})
