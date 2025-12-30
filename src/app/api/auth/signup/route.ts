import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { rateLimiters, getClientIp } from '@/lib/rate-limit'
import { validatePassword } from '@/lib/validation'

// Create admin client for server-side auth
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

export async function POST(request: NextRequest) {
  // Apply rate limiting by IP (stricter for signup - 3 per minute)
  const clientIp = getClientIp(request.headers)
  const rateLimitResult = rateLimiters.signup.isAllowed(`ip:${clientIp}`)

  // Set rate limit headers
  const headers = {
    'RateLimit-Limit': '3',
    'RateLimit-Remaining': Math.max(0, rateLimitResult.remaining).toString(),
    'RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
  }

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
      { status: 429, headers }
    )
  }

  try {
    const { email, password, name } = await request.json()

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

    // Password strength validation (server-side enforcement)
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error || 'Password does not meet requirements' },
        { status: 400, headers }
      )
    }

    // Name validation (optional but sanitize if provided)
    const sanitizedName = name ? String(name).slice(0, 100).trim() : ''

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Attempt signup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: sanitizedName,
        },
      },
    })

    if (error) {
      // Check for specific errors but don't reveal too much
      if (error.message.includes('already registered')) {
        // Don't reveal if email exists - return generic success
        return NextResponse.json(
          { message: 'If this email is not registered, you will receive a confirmation email.' },
          { status: 200, headers }
        )
      }

      return NextResponse.json(
        { error: 'Signup failed. Please try again.' },
        { status: 400, headers }
      )
    }

    return NextResponse.json(
      {
        message: 'Signup successful. Please check your email to confirm your account.',
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
      },
      { status: 200, headers }
    )
  } catch (error) {
    // Don't log full error details
    console.error('Signup error occurred')
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500, headers }
    )
  }
}
