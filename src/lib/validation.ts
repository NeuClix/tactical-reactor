/**
 * Input validation and sanitization utilities
 * Used to protect against prompt injection, XSS, and other attacks
 */

interface ValidationOptions {
  maxLength?: number
  minLength?: number
  allowedChars?: RegExp
  blockPatterns?: RegExp[]
}

/**
 * Validate and sanitize prompt input
 * Protects against prompt injection attacks
 */
export function validatePrompt(
  prompt: unknown,
  options: ValidationOptions = {}
): { valid: boolean; error?: string; sanitized?: string } {
  const {
    maxLength = 10000,
    minLength = 1,
    blockPatterns = [
      /ignore\s+(previous|above|prior)\s+instructions/gi,
      /you\s+are\s+now/gi,
      /new\s+(role|instructions|system|prompt)/gi,
      /forget\s+everything/gi,
      /disregard\s+all/gi,
      /override\s+instructions/gi,
      /execute\s+(command|code)/gi,
    ],
  } = options

  // Type check
  if (typeof prompt !== 'string') {
    return { valid: false, error: 'Prompt must be a string' }
  }

  // Length check
  if (prompt.length < minLength) {
    return { valid: false, error: `Prompt must be at least ${minLength} characters` }
  }

  if (prompt.length > maxLength) {
    return { valid: false, error: `Prompt cannot exceed ${maxLength} characters` }
  }

  // Trim whitespace
  const sanitized = prompt.trim()

  // Check for blocked patterns
  for (const pattern of blockPatterns) {
    if (pattern.test(sanitized)) {
      return { valid: false, error: 'Prompt contains prohibited content' }
    }
  }

  return { valid: true, sanitized }
}

/**
 * Validate content type enum
 */
export function validateContentType(
  type: unknown,
  allowedTypes: string[] = ['blog', 'social', 'email', 'page', 'ideas']
): boolean {
  return typeof type === 'string' && allowedTypes.includes(type)
}

/**
 * Validate pricing tier
 */
export function validateTier(
  tier: unknown,
  allowedTiers: string[] = ['starter', 'pro', 'agency']
): boolean {
  return typeof tier === 'string' && allowedTiers.includes(tier)
}

/**
 * Validate price ID matches tier
 */
export function validatePriceIdForTier(
  priceId: string,
  tier: string,
  pricingMap: Record<string, { priceId: string }>
): boolean {
  const tierConfig = pricingMap[tier]
  return tierConfig ? tierConfig.priceId === priceId : false
}

/**
 * Validate password strength
 * Enforces minimum requirements for account security
 */
export function validatePassword(password: unknown): { valid: boolean; error?: string } {
  if (typeof password !== 'string') {
    return { valid: false, error: 'Password must be a string' }
  }

  const MIN_LENGTH = 12
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (password.length < MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${MIN_LENGTH} characters` }
  }

  if (!hasLowerCase || !hasUpperCase) {
    return { valid: false, error: 'Password must contain both uppercase and lowercase letters' }
  }

  if (!hasNumbers) {
    return { valid: false, error: 'Password must contain at least one number' }
  }

  if (!hasSpecialChar) {
    return { valid: false, error: 'Password must contain at least one special character' }
  }

  return { valid: true }
}

/**
 * Validate email format
 */
export function validateEmail(email: unknown): boolean {
  if (typeof email !== 'string') {
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate Stripe price ID format
 */
export function validateStripePriceId(priceId: unknown): boolean {
  if (typeof priceId !== 'string') {
    return false
  }

  // Stripe price IDs start with 'price_'
  return /^price_[a-zA-Z0-9]+$/.test(priceId)
}

/**
 * Sanitize URL to prevent open redirect attacks
 */
export function validateRedirectUrl(url: unknown, allowedOrigins: string[]): boolean {
  if (typeof url !== 'string') {
    return false
  }

  try {
    const parsed = new URL(url, 'http://localhost')

    // Block protocol-relative URLs
    if (url.startsWith('//')) {
      return false
    }

    // Check against allowed origins
    return allowedOrigins.some((origin) => parsed.origin === origin)
  } catch {
    return false
  }
}
