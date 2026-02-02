"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  User,
  Settings,
  CreditCard,
  Shield,
  Bell,
  Loader2,
  Check,
  Zap,
  Crown,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { SUBSCRIPTION_PLANS, CREDIT_PACKS } from "@/lib/products"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Checkout from "@/components/checkout/checkout"

interface UserData {
  email: string
  companyName: string
  plan: string
  credits: number
  creditsUsed: number
}

export function UserHubContent() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [companyName, setCompanyName] = useState("")
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [selectedCredits, setSelectedCredits] = useState<string | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Mock user data - in production, fetch from your database
      setUserData({
        email: user.email || "",
        companyName: user.user_metadata?.company_name || "Your Company",
        plan: "free",
        credits: 5,
        creditsUsed: 2,
      })
      setCompanyName(user.user_metadata?.company_name || "Your Company")
    }
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000))
    toast.success("Profile updated successfully")
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const currentPlan = SUBSCRIPTION_PLANS.find((p) => p.id === userData?.plan) || SUBSCRIPTION_PLANS[0]
  const creditsRemaining = (userData?.credits || 0) - (userData?.creditsUsed || 0)
  const creditsPercentUsed = userData?.credits ? ((userData?.creditsUsed || 0) / userData.credits) * 100 : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">User Hub</h1>
        <p className="text-muted-foreground">
          Manage your account, subscription, and settings
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="subscription" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <CreditCard className="w-4 h-4 mr-2" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="credits" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="w-4 h-4 mr-2" />
            Credits
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Account Overview */}
            <Card className="bg-card border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-card-foreground">Account Details</CardTitle>
                <CardDescription>Update your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-input border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userData?.email}
                      disabled
                      className="bg-input border-border"
                    />
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Current Plan */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Current Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">{currentPlan.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {currentPlan.priceInCents === 0
                        ? "Free"
                        : `$${(currentPlan.priceInCents / 100).toFixed(2)}/month`}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Credits Used</span>
                    <span className="text-card-foreground">
                      {userData?.creditsUsed} / {userData?.credits}
                    </span>
                  </div>
                  <Progress value={creditsPercentUsed} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {creditsRemaining} credits remaining this month
                  </p>
                </div>

                <Button variant="outline" className="w-full bg-transparent">
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`bg-card border-border relative ${
                  plan.popular ? "ring-2 ring-primary" : ""
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <CardTitle className="text-card-foreground">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-3xl font-bold text-card-foreground">
                      {plan.priceInCents === 0 ? "Free" : `$${(plan.priceInCents / 100).toFixed(0)}`}
                    </span>
                    {plan.priceInCents > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.id === userData?.plan ? (
                    <Button disabled className="w-full" variant="secondary">
                      Current Plan
                    </Button>
                  ) : plan.id === "free" ? (
                    <Button variant="outline" className="w-full bg-transparent">
                      Downgrade
                    </Button>
                  ) : (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => setSelectedPlan(plan.id)}
                        >
                          {plan.popular ? (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Upgrade
                            </>
                          ) : (
                            "Select Plan"
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Subscribe to {plan.name}</DialogTitle>
                          <DialogDescription>
                            Complete your subscription to unlock all features
                          </DialogDescription>
                        </DialogHeader>
                        <Checkout productId={plan.id} />
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Your Credits</CardTitle>
              <CardDescription>
                Purchase additional credits for AI generations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 p-4 rounded-lg bg-muted/50 mb-6">
                <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-card-foreground">{creditsRemaining}</p>
                  <p className="text-muted-foreground">Credits Available</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-lg font-semibold text-card-foreground">
                    {userData?.creditsUsed} used
                  </p>
                </div>
              </div>

              <h3 className="font-semibold text-card-foreground mb-4">Buy Credit Packs</h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {CREDIT_PACKS.map((pack) => (
                  <Card
                    key={pack.id}
                    className={`bg-muted/50 border-border cursor-pointer hover:border-primary transition-colors ${
                      pack.popular ? "ring-2 ring-primary" : ""
                    }`}
                  >
                    {pack.popular && (
                      <Badge className="absolute -top-2 right-4 bg-primary text-primary-foreground text-xs">
                        Best Value
                      </Badge>
                    )}
                    <CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold text-card-foreground">{pack.credits}</p>
                      <p className="text-muted-foreground mb-2">Credits</p>
                      <p className="text-lg font-semibold text-primary mb-4">
                        ${(pack.priceInCents / 100).toFixed(2)}
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant={pack.popular ? "default" : "outline"}
                            className={pack.popular ? "w-full bg-primary text-primary-foreground" : "w-full"}
                            onClick={() => setSelectedCredits(pack.id)}
                          >
                            Buy Now
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Purchase {pack.credits} Credits</DialogTitle>
                            <DialogDescription>
                              Complete your purchase to add credits to your account
                            </DialogDescription>
                          </DialogHeader>
                          <Checkout productId={pack.id} />
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Email notifications", description: "Receive updates via email", enabled: true },
                  { label: "Marketing emails", description: "News and product updates", enabled: false },
                  { label: "Content published alerts", description: "When scheduled content goes live", enabled: true },
                  { label: "Weekly analytics digest", description: "Summary of your performance", enabled: true },
                ].map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium text-card-foreground">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Button
                      variant={setting.enabled ? "default" : "outline"}
                      size="sm"
                      className={setting.enabled ? "bg-primary text-primary-foreground" : ""}
                    >
                      {setting.enabled ? "On" : "Off"}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="bg-input border-border"
                  />
                </div>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Update Password
                </Button>

                <div className="pt-4 border-t border-border">
                  <Button variant="destructive" className="w-full">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
