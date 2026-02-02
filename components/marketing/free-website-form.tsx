"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Zap, Check, MapPin, Globe, Rocket } from "lucide-react"
import { toast } from "sonner"

const BUSINESS_TYPES = [
  "Restaurant / Food Service",
  "Retail / Shopping",
  "Health & Wellness",
  "Home Services",
  "Professional Services",
  "Automotive",
  "Beauty & Personal Care",
  "Fitness & Recreation",
  "Real Estate",
  "Legal Services",
  "Financial Services",
  "Education & Tutoring",
  "Pet Services",
  "Event Planning",
  "Other",
]

interface FreeWebsiteFormProps {
  onSuccess?: () => void
}

export function FreeWebsiteForm({ onSuccess }: FreeWebsiteFormProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    description: "",
    services: "",
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simulate API call - in production this would create the website
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    toast.success("Chain Reaction Initiated! Your free website is being generated.")
    setIsSubmitting(false)
    onSuccess?.()
  }

  const canProceedStep1 = formData.businessName && formData.businessType && formData.city && formData.state
  const canProceedStep2 = formData.email && formData.phone
  const canSubmit = canProceedStep1 && canProceedStep2

  return (
    <Card className="bg-card border-border w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-2">
        <Badge className="w-fit mx-auto mb-3 bg-primary/10 text-primary border-primary/20">
          <Zap className="w-3 h-3 mr-1" />
          100% Free - No Credit Card Required
        </Badge>
        <CardTitle className="text-2xl text-foreground">
          Activate Your Free Local SEO Reactor
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Get a professionally designed website + hosting + local SEO optimization in minutes.
          Zero cost. Zero catch. Infinite potential.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step >= s 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-secondary text-muted-foreground"
              }`}>
                {step > s ? <Check className="w-4 h-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-secondary"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Business Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="font-semibold text-foreground">Business Intel</h3>
              <p className="text-sm text-muted-foreground">Tell us about your local business</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="e.g., Joe's Pizza Palace"
                value={formData.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType">Business Type *</Label>
              <Select value={formData.businessType} onValueChange={(v) => updateField("businessType", v)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., Austin"
                  value={formData.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="e.g., TX"
                  value={formData.state}
                  onChange={(e) => updateField("state", e.target.value)}
                  className="bg-input border-border"
                />
              </div>
            </div>

            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
            >
              Continue to Contact Info
              <Rocket className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="font-semibold text-foreground">Contact Coordinates</h3>
              <p className="text-sm text-muted-foreground">How can customers reach you?</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Business Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@business.com"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="bg-input border-border"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
              >
                Continue
                <Rocket className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Business Details */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="font-semibold text-foreground">Reactor Fuel</h3>
              <p className="text-sm text-muted-foreground">Help us build your perfect website</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell us what makes your business special..."
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="bg-input border-border min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Main Services (optional)</Label>
              <Textarea
                id="services"
                placeholder="List your top services, separated by commas..."
                value={formData.services}
                onChange={(e) => updateField("services", e.target.value)}
                className="bg-input border-border min-h-[60px]"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => setStep(2)}
              >
                Back
              </Button>
              <Button
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initiating Chain Reaction...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Launch My Free Website
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* What's included */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">Your free reactor includes:</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-secondary/50">
              <Globe className="w-4 h-4 mx-auto mb-1 text-primary" />
              <span className="text-xs text-muted-foreground">Custom Website</span>
            </div>
            <div className="p-2 rounded bg-secondary/50">
              <MapPin className="w-4 h-4 mx-auto mb-1 text-primary" />
              <span className="text-xs text-muted-foreground">Local SEO</span>
            </div>
            <div className="p-2 rounded bg-secondary/50">
              <Rocket className="w-4 h-4 mx-auto mb-1 text-primary" />
              <span className="text-xs text-muted-foreground">Free Hosting</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
