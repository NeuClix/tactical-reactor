import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'

// Create admin client for server-side auth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export async function POST(request: NextRequest) {
  // Apply rate limiting by IP
  const clientIp = getClientIp(request.headers)
  const rateLimitResult = rateLimiters.login.isAllowed(`ip:${clientIp}`)

  // Set rate limit headers
  const headers = {
    'RateLimit-Limit': '5',
    'RateLimit-Remaining': Math.max(0, rateLimitResult.remaining).toString(),
    'RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
  }

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers }
    )
  }

  try {
    const { email, password } = await request.json()

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400, headers }
      )
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400, headers }
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Generic error message to prevent user enumeration
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401, headers }
      )
    }

    // Return session data (excluding sensitive tokens from logs)
    return NextResponse.json(
      {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          user_metadata: data.user?.user_metadata,
        },
        session: data.session,
      },
      { status: 200, headers }
    )
  } catch (error) {
    // Don't log full error details in production
    console.error('Login error occurred')
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500, headers }
    )
  }
}
