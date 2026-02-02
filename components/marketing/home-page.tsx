"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SUBSCRIPTION_PLANS } from "@/lib/products"
import { 
  Zap, 
  Target, 
  BarChart3, 
  Globe, 
  ArrowRight,
  Check,
  Sparkles,
  Radio,
  Rocket,
  MapPin,
  Star,
  Users,
  TrendingUp,
  Clock,
  Shield,
  ChevronDown,
} from "lucide-react"
import { FreeWebsiteForm } from "./free-website-form"

// Particle background effect
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  const [showForm, setShowForm] = useState(false)

  const scrollToForm = () => {
    setShowForm(true)
    setTimeout(() => {
      document.getElementById("free-website-form")?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/images/icon.png"
              alt="Tactical Reactor"
              width={40}
              height={40}
              className="transition-all duration-300 group-hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground leading-tight">Tactical Reactor</span>
              <span className="text-xs text-muted-foreground leading-tight">by NeuClix</span>
            </div>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#free-offer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Free Website
            </Link>
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Upgrade
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Log in
              </Button>
            </Link>
            <Button 
              onClick={scrollToForm}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              Get Free Website
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section - FREE Website Focus */}
      <section className="relative pt-28 pb-16 px-6 overflow-hidden">
        <ParticleField />
        
        {/* Radial glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Logo */}
            <div className="mb-6 group cursor-pointer">
              <Image
                src="/images/logo.png"
                alt="NeuClix"
                width={350}
                height={100}
                className="mx-auto transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                priority
              />
            </div>
            
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 text-sm px-4 py-1">
              <Sparkles className="w-4 h-4 mr-2" />
              LIMITED TIME: 100% FREE for Local Businesses
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight text-balance">
              Your{" "}
              <span className="text-primary relative">
                FREE
                <span className="absolute -inset-1 bg-primary/20 blur-xl -z-10" />
              </span>{" "}
              Local SEO Website
              <br />
              <span className="text-3xl md:text-5xl text-muted-foreground">+ Hosting. Forever.</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto text-pretty">
              We build local businesses a <strong className="text-foreground">professionally designed, SEO-optimized website</strong> with 
              free hosting. No catch. No credit card. Just pure marketing fusion for your business.
            </p>

            {/* Value Props */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                <span>Custom Website Design</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                <span>Hyper-Local SEO</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                <span>Free Hosting Forever</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-4 h-4 text-primary" />
                <span>Mobile Optimized</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={scrollToForm}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(34,197,94,0.4)] text-lg px-8"
              >
                Claim Your Free Website
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-secondary bg-transparent text-lg px-8">
                  See How It Works
                  <ChevronDown className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="ml-2">Trusted by 2,500+ local businesses</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
            {[
              { value: "$0", label: "Cost to you", icon: <Sparkles className="w-5 h-5" /> },
              { value: "24hr", label: "Website live time", icon: <Clock className="w-5 h-5" /> },
              { value: "300%", label: "Avg. visibility boost", icon: <TrendingUp className="w-5 h-5" /> },
              { value: "2,500+", label: "Businesses powered", icon: <Users className="w-5 h-5" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-lg bg-card/50 border border-border">
                <div className="flex items-center justify-center gap-2 text-primary mb-1">
                  {stat.icon}
                  <span className="text-2xl md:text-3xl font-bold">{stat.value}</span>
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Website Form Section */}
      <section id="free-offer" className="py-16 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="w-3 h-3 mr-1" />
              Zero Risk Activation
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Initiate Your Free Website Reactor
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Fill out the form below and we'll build your custom local SEO website within 24 hours.
              No payment info required. Ever.
            </p>
          </div>

          <div id="free-website-form">
            <FreeWebsiteForm onSuccess={() => window.location.href = "/auth/sign-up"} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Radio className="w-3 h-3 mr-1 animate-pulse" />
              Chain Reaction Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              From Zero to Online in 3 Simple Steps
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered reactor builds your complete local business presence automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Input Business Intel",
                description: "Share your business name, location, and services. Takes less than 2 minutes.",
                icon: <MapPin className="w-8 h-8" />,
              },
              {
                step: "02",
                title: "AI Fusion Begins",
                description: "Our Tactical Reactor analyzes your market and generates an SEO-optimized website.",
                icon: <Sparkles className="w-8 h-8" />,
              },
              {
                step: "03",
                title: "Go Live & Dominate",
                description: "Your website goes live on free hosting. Start attracting local customers immediately.",
                icon: <Rocket className="w-8 h-8" />,
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <Card className="bg-card border-border h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-5xl font-bold text-primary/20">{item.step}</span>
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        {item.icon}
                      </div>
                    </div>
                    <CardTitle className="text-foreground text-xl">{item.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-base">{item.description}</CardDescription>
                  </CardHeader>
                </Card>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Target className="w-3 h-3 mr-1" />
              Reactor Core Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Your Free Website Includes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every free website comes loaded with powerful features typically costing $200+/month elsewhere.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Custom Domain-Ready",
                description: "Professional website on our subdomain, or connect your own domain for free.",
                included: true,
              },
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "Hyper-Local SEO",
                description: "AI-optimized for your specific city + service area. Rank where it matters.",
                included: true,
              },
              {
                icon: <Rocket className="w-6 h-6" />,
                title: "Lightning Fast Hosting",
                description: "Enterprise-grade hosting on our reactor network. 99.9% uptime guaranteed.",
                included: true,
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "SSL Security",
                description: "Free SSL certificate included. Your customers' data stays protected.",
                included: true,
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Basic Analytics",
                description: "See who's visiting your site and where they're coming from.",
                included: true,
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Contact Forms",
                description: "Built-in lead capture forms that send inquiries straight to your inbox.",
                included: true,
              },
            ].map((feature, i) => (
              <Card key={i} className="bg-card border-border hover:border-primary/50 transition-all duration-300 group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-shadow">
                      {feature.icon}
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                      FREE
                    </Badge>
                  </div>
                  <CardTitle className="text-foreground">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button 
              size="lg" 
              onClick={scrollToForm}
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              Get All This Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Upgrade Section (Pricing) */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              Amplify Your Reactor
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready for More Power?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Love your free website? Upgrade to unlock the full Tactical Reactor suite: 
              AI content generation, lead fission, competitor analysis, and more.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <Card 
                key={plan.id} 
                className={`relative bg-card border-border transition-all duration-300 ${
                  plan.popular 
                    ? "border-primary shadow-[0_0_30px_rgba(34,197,94,0.2)] scale-105" 
                    : "hover:border-primary/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {plan.id === "free" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="outline" className="bg-background border-primary text-primary">
                      Current: Free Website
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${
                      plan.nuclearTier === "isotope" ? "bg-muted-foreground" :
                      plan.nuclearTier === "reactor" ? "bg-blue-500" :
                      plan.nuclearTier === "fusion" ? "bg-primary animate-pulse" :
                      "bg-primary shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                    }`} />
                    <CardTitle className="text-foreground">{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      {plan.priceInCents === 0 ? "Free" : `$${plan.priceInCents / 100}`}
                    </span>
                    {plan.priceInCents > 0 && (
                      <span className="text-muted-foreground">/month</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && (
                      <li className="text-sm text-muted-foreground">
                        + {plan.features.length - 4} more features
                      </li>
                    )}
                  </ul>
                  <Link href={plan.id === "free" ? "#free-offer" : "/auth/sign-up"}>
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(34,197,94,0.3)]" 
                          : plan.id === "free"
                          ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {plan.id === "free" ? "Get Started Free" : "Upgrade Reactor"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 relative overflow-hidden bg-card/30">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
        <ParticleField />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="relative inline-block mb-6 group cursor-pointer">
            <Image
              src="/images/icon.png"
              alt="Tactical Reactor"
              width={80}
              height={80}
              className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
            />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stop Paying for What Should Be{" "}
            <span className="text-primary">Free</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Other companies charge $50-200/month for basic local websites. 
            We believe every local business deserves a professional online presence—at zero cost.
          </p>
          
          <Button 
            size="lg" 
            onClick={scrollToForm}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_30px_rgba(34,197,94,0.4)] text-lg px-8"
          >
            Claim Your Free Website Now
            <Zap className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-6">
            No credit card. No contracts. No catch. Just free.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/images/icon.png"
                alt="Tactical Reactor"
                width={32}
                height={32}
                className="transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]"
              />
              <div className="flex flex-col">
                <span className="font-bold text-foreground leading-tight">Tactical Reactor</span>
                <span className="text-xs text-muted-foreground">by NeuClix</span>
              </div>
            </Link>
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Support</Link>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Powered by nuclear AI fusion
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
