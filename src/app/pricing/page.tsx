'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PRICING_TIERS, type PricingTier } from '@/lib/stripe'
import { Check, Zap, Shield, TrendingUp } from 'lucide-react'

export default function PricingPage() {
  const [loading, setLoading] = useState(false)
  const [selectedTier, setSelectedTier] = useState<PricingTier>('starter')

  const handleCheckout = async (tier: PricingTier) => {
    setLoading(true)

    try {
      // Fetch CSRF token first
      const csrfResponse = await fetch('/api/csrf-token')
      const { token: csrfToken } = await csrfResponse.json()

      if (!csrfToken) {
        throw new Error('Failed to get security token')
      }

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: PRICING_TIERS[tier].priceId,
          tier,
          csrfToken,
        }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      // Validate redirect URL - only allow Stripe domains
      if (url) {
        const allowedOrigins = [
          'https://checkout.stripe.com',
          'https://billing.stripe.com',
        ]

        try {
          const urlObj = new URL(url)
          if (allowedOrigins.some(origin => url.startsWith(origin))) {
            window.location.href = url
          } else {
            throw new Error('Invalid checkout URL')
          }
        } catch {
          throw new Error('Invalid checkout URL')
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            <span className="gradient-text-tech">Transparent Pricing</span>
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Choose the perfect AI-powered plan for your business intelligence needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-6 lg:grid-cols-3 mb-16">
          {(Object.entries(PRICING_TIERS) as [PricingTier, typeof PRICING_TIERS.starter][]).map(
            ([tier, details]) => {
              const icons = {
                starter: <Zap className="w-6 h-6" />,
                pro: <TrendingUp className="w-6 h-6" />,
                agency: <Shield className="w-6 h-6" />,
              }
              return (
                <div
                  key={tier}
                  className={`card-glass p-8 flex flex-col transition-all duration-300 ${
                    tier === 'pro'
                      ? 'ring-2 ring-accent-500 scale-105 shadow-glow-green'
                      : 'hover:shadow-glow'
                  }`}
                >
                  {tier === 'pro' && (
                    <Badge className="w-fit mb-4 bg-accent-500/80 text-white">
                      Most Popular
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-accent-400">{icons[tier]}</div>
                    <div>
                      <h3 className="text-2xl font-bold text-dark-50">{details.name}</h3>
                      <p className="text-sm text-dark-400">{details.description}</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    {/* Price */}
                    <div className="pt-4 border-t border-primary-500/20">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-primary-300">
                          ${details.monthlyPrice}
                        </span>
                        <span className="text-dark-400">/month</span>
                      </div>
                      <p className="text-xs text-dark-400 mt-2">
                        Billed annually at ${details.annualPrice}/year
                      </p>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => handleCheckout(tier)}
                      disabled={loading}
                      className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                        tier === 'pro'
                          ? 'btn-primary'
                          : 'btn-secondary'
                      }`}
                    >
                      {loading ? 'Processing...' : 'Get Started'}
                    </button>

                    {/* Features */}
                    <div className="space-y-3 pt-4 border-t border-primary-500/20">
                      {details.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3">
                          <Check className="h-5 w-5 text-accent-400 flex-shrink-0" />
                          <span className="text-sm text-dark-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
          )}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto border-t border-primary-500/20 pt-12">
          <h2 className="text-3xl font-bold text-dark-50 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="card-gradient p-6">
              <h3 className="font-semibold text-dark-50">
                Can I change my plan anytime?
              </h3>
              <p className="text-dark-300 mt-2">
                Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>
            <div className="card-gradient p-6">
              <h3 className="font-semibold text-dark-50">
                Do you offer a free trial?
              </h3>
              <p className="text-dark-300 mt-2">
                Contact us for a free trial of any plan. We're happy to help you get started.
              </p>
            </div>
            <div className="card-gradient p-6">
              <h3 className="font-semibold text-dark-50">
                What happens if I exceed my request limit?
              </h3>
              <p className="text-dark-300 mt-2">
                We'll notify you when you're approaching your limit. You can upgrade to a higher tier or purchase additional requests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
