---
name: stripe-implementation
description: Stripe payment processing, subscriptions, webhooks, and billing patterns for SaaS. Use when implementing payment flows and subscription management.
---

# Stripe Implementation for SaaS

## Setup

**Initialize Stripe in your project:**

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

// Public key for client-side
export const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
```

## Pricing Tiers

**Define pricing structure:**

```typescript
export const PRICING_TIERS = {
  starter: {
    name: 'Starter',
    priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID!,
    monthlyPrice: 29,
    annualPrice: 290,
    features: ['Basic AI generation', '100 requests/month'],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID!,
    monthlyPrice: 99,
    annualPrice: 990,
    features: ['Advanced AI features', '1000 requests/month'],
  },
  agency: {
    name: 'Agency',
    priceId: process.env.NEXT_PUBLIC_STRIPE_AGENCY_PRICE_ID!,
    monthlyPrice: 299,
    annualPrice: 2990,
    features: ['Unlimited requests', 'Priority support'],
  },
}
```

## Checkout Flow

**Create checkout session:**

```typescript
import { stripe, publishableKey } from '@/lib/stripe'
import { loadStripe } from '@stripe/js'

// Server-side: Create checkout session
export async function POST(request: NextRequest) {
  const { priceId, userId } = await request.json()

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
    customer_email: userEmail,
    metadata: {
      userId,
    },
  })

  return NextResponse.json({ sessionId: session.id })
}

// Client-side: Redirect to Stripe
const stripe = await loadStripe(publishableKey)
const { sessionId } = await fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({ priceId, userId }),
})

await stripe.redirectToCheckout({ sessionId })
```

## Webhook Handling

**Process Stripe events:**

```typescript
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Handle events
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await updateSubscriptionInDb(subscription)
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await deleteSubscriptionInDb(subscription.id)
      break
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      await logPaymentSuccess(invoice)
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await notifyPaymentFailure(invoice.customer_email)
      break
    }
  }

  return NextResponse.json({ received: true })
}

async function updateSubscriptionInDb(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      plan: subscription.items.data[0].price.nickname,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    })
    .single()
}
```

## Subscription Management

**Check subscription status:**

```typescript
export async function getUserSubscription(userId: string) {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !subscription) {
    return null
  }

  return subscription
}

export async function hasSubscriptionAccess(userId: string, feature: string) {
  const subscription = await getUserSubscription(userId)

  if (!subscription || subscription.status !== 'active') {
    return false
  }

  const tierFeatures: Record<string, string[]> = {
    starter: ['basic_generation', 'basic_content'],
    pro: ['advanced_generation', 'all_content'],
    agency: ['unlimited_generation', 'unlimited_content'],
  }

  return tierFeatures[subscription.plan]?.includes(feature) ?? false
}

export async function enforceSubscriptionLimit(userId: string) {
  const subscription = await getUserSubscription(userId)

  if (!subscription) {
    throw new Error('No active subscription')
  }

  const limits: Record<string, number> = {
    starter: 100,
    pro: 1000,
    agency: 99999,
  }

  const usage = await getMonthlyUsage(userId)
  const limit = limits[subscription.plan]

  if (usage >= limit) {
    throw new Error('Usage limit exceeded')
  }
}
```

## Customer Portal

**Allow users to manage subscriptions:**

```typescript
export async function POST(request: NextRequest) {
  const userId = await getAuthUser()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: 'No subscription found' },
      { status: 404 }
    )
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
  })

  return NextResponse.json({ url: session.url })
}
```

## Testing

**Use Stripe test mode:**

```typescript
// Test cards
// Success: 4242 4242 4242 4242
// Decline: 4000 0000 0000 0002
// 3D Secure: 4000 0025 0000 3155

// Test webhooks locally
// stripe listen --forward-to localhost:3000/api/webhooks/stripe

// Trigger test event
// stripe trigger customer.subscription.created
```

## Error Handling

```typescript
try {
  const session = await stripe.checkout.sessions.create({...})
} catch (error) {
  if (error instanceof Stripe.errors.CardError) {
    return NextResponse.json(
      { error: 'Card declined' },
      { status: 400 }
    )
  } else if (error instanceof Stripe.errors.RateLimitError) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } else {
    throw error
  }
}
```

## Security

1. **Never expose secret key** - Only use on server
2. **Verify webhook signatures** - Always construct events securely
3. **Validate priceIds** - Check against your defined tiers
4. **Use test mode** - Always test in development
5. **Log transactions** - For audit trails
6. **Handle idempotency** - Webhooks can be retried
