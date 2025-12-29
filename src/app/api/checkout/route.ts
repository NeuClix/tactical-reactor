import { NextRequest, NextResponse } from 'next/server'
import { stripe, PRICING_TIERS } from '@/lib/stripe'
import { createServerComponentClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { priceId, tier } = await request.json()

    // Verify user is authenticated
    const supabase = await createServerComponentClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify price ID matches our tiers
    const tierEntry = Object.entries(PRICING_TIERS).find(
      ([_, tier]) => tier.priceId === priceId
    )

    if (!tierEntry) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
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

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
