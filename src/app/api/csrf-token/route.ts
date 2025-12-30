import { NextResponse } from 'next/server'
import { getOrCreateCsrfToken } from '@/lib/csrf'

/**
 * GET /api/csrf-token
 * Returns CSRF token for client-side forms
 */
export async function GET() {
  try {
    const token = await getOrCreateCsrfToken()
    return NextResponse.json({ token })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    )
  }
}
