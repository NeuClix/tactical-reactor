import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICING_TIERS } from '@/lib/stripe'
import { createServerComponentClient } from '@/lib/supabase-server'
import { validateStripePriceId, validateTier, validatePriceIdForTier } from '@/lib/validation'
import { rateLimiters, getClientIdentifier, getClientIp, checkRateLimit } from '@/lib/rate-limit'
import { verifyCsrfToken } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
    let parsedBody
    try {
      parsedBody = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { priceId, tier, csrfToken } = parsedBody

    // Verify CSRF token
    const validCsrf = await verifyCsrfToken(csrfToken)
    if (!validCsrf) {
      return NextResponse.json(
        { error: 'Invalid request. Please refresh and try again.' },
        { status: 403 }
      )
    }

    // Verify user is authenticated
    const supabase = await createServerComponentClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check rate limit
    const identifier = getClientIdentifier(user.id, getClientIp(request.headers))
    const rateLimitCheck = checkRateLimit(identifier, rateLimiters.checkout)

    const headers = new Headers()
    Object.entries(rateLimitCheck.headers).forEach(([key, value]) => {
      headers.set(key, value)
    })

    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers }
      )
    }

    // Validate input
    if (!validateStripePriceId(priceId)) {
      return NextResponse.json({ error: 'Invalid price ID format' }, { status: 400, headers })
    }

    if (!validateTier(tier)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400, headers })
    }

    // Verify price ID matches tier and tier
    if (!validatePriceIdForTier(priceId, tier, PRICING_TIERS)) {
      return NextResponse.json(
        { error: 'Invalid price/tier combination' },
        { status: 400, headers }
      )
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        tier,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url }, { headers })
  } catch (error) {
    // Log error server-side for debugging, but don't expose to client
    console.error('Checkout error:', error instanceof Error ? error.message : 'Unknown error')

    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    )
  }
}
