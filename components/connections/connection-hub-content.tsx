"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Link2,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  BarChart3,
  Globe,
  Database,
  CheckCircle,
  XCircle,
  Settings,
  RefreshCw,
  ExternalLink,
  Plus,
  Loader2,
  Brain,
} from "lucide-react"
import { toast } from "sonner"
import { AIProvidersTab } from "./ai-providers-tab"
import { SocialConnectionsTab } from "./social-connections-tab"

interface Integration {
  id: string
  name: string
  category: "social" | "analytics" | "crm" | "email" | "cms"
  icon: React.ReactNode
  connected: boolean
  lastSync?: Date
  accountName?: string
}

export function ConnectionHubContent() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "twitter",
      name: "Twitter / X",
      category: "social",
      icon: <Twitter className="w-5 h-5" />,
      connected: true,
      lastSync: new Date(),
      accountName: "@yourcompany",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      category: "social",
      icon: <Linkedin className="w-5 h-5" />,
      connected: true,
      lastSync: new Date(),
      accountName: "Your Company Page",
    },
    {
      id: "facebook",
      name: "Facebook",
      category: "social",
      icon: <Facebook className="w-5 h-5" />,
      connected: false,
      icon: <Facebook className="w-5 h-5" />,
    },
    {
      id: "instagram",
      name: "Instagram",
      category: "social",
      icon: <Instagram className="w-5 h-5" />,
      connected: false,
    },
    {
      id: "youtube",
      name: "YouTube",
      category: "social",
      icon: <Youtube className="w-5 h-5" />,
      connected: false,
    },
    {
      id: "google-analytics",
      name: "Google Analytics",
      category: "analytics",
      icon: <BarChart3 className="w-5 h-5" />,
      connected: true,
      lastSync: new Date(),
      accountName: "GA4 - Main Property",
    },
    {
      id: "search-console",
      name: "Google Search Console",
      category: "analytics",
      icon: <Globe className="w-5 h-5" />,
      connected: false,
    },
    {
      id: "hubspot",
      name: "HubSpot",
      category: "crm",
      icon: <Database className="w-5 h-5" />,
      connected: false,
    },
    {
      id: "salesforce",
      name: "Salesforce",
      category: "crm",
      icon: <Database className="w-5 h-5" />,
      connected: false,
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      category: "email",
      icon: <Mail className="w-5 h-5" />,
      connected: true,
      lastSync: new Date(Date.now() - 3600000),
      accountName: "Marketing List",
    },
    {
      id: "wordpress",
      name: "WordPress",
      category: "cms",
      icon: <Globe className="w-5 h-5" />,
      connected: false,
    },
  ])

  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const handleConnect = async (id: string) => {
    setIsConnecting(id)
    // Simulate connection
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIntegrations(
      integrations.map((int) =>
        int.id === id
          ? { ...int, connected: true, lastSync: new Date(), accountName: "Connected Account" }
          : int
      )
    )
    toast.success(`Connected to ${integrations.find((i) => i.id === id)?.name}`)
    setIsConnecting(null)
  }

  const handleDisconnect = (id: string) => {
    setIntegrations(
      integrations.map((int) =>
        int.id === id ? { ...int, connected: false, lastSync: undefined, accountName: undefined } : int
      )
    )
    toast.success("Integration disconnected")
  }

  const getIntegrationsByCategory = (category: Integration["category"]) =>
    integrations.filter((i) => i.category === category)

  const connectedCount = integrations.filter((i) => i.connected).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Connection Hub</h1>
        <p className="text-muted-foreground">
          Connect your platforms and tools for seamless integration
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Link2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">{connectedCount}</p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {integrations.filter((i) => i.connected && i.category === "social").length}
                </p>
                <p className="text-sm text-muted-foreground">Social Platforms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {integrations.filter((i) => i.connected && i.category === "analytics").length}
                </p>
                <p className="text-sm text-muted-foreground">Analytics Tools</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-card-foreground">
                  {integrations.filter((i) => i.connected && (i.category === "crm" || i.category === "email")).length}
                </p>
                <p className="text-sm text-muted-foreground">CRM / Email</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="ai" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1">
            <Brain className="w-4 h-4" />
            AI Providers
          </TabsTrigger>
          <TabsTrigger value="social" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Social Media
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="crm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            CRM
          </TabsTrigger>
          <TabsTrigger value="email" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Email Marketing
          </TabsTrigger>
          <TabsTrigger value="cms" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            CMS
          </TabsTrigger>
        </TabsList>

        {/* AI Providers Tab */}
        <TabsContent value="ai">
          <AIProvidersTab />
        </TabsContent>

        {/* Social Media Tab - Real OAuth Connections */}
        <TabsContent value="social">
          <SocialConnectionsTab />
        </TabsContent>

        {/* Other tabs with placeholder integrations */}
        {(["analytics", "crm", "email", "cms"] as const).map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getIntegrationsByCategory(category).map((integration) => (
                <Card key={integration.id} className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            integration.connected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {integration.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-card-foreground">{integration.name}</h3>
                          {integration.connected ? (
                            <div className="mt-1">
                              <p className="text-sm text-muted-foreground">{integration.accountName}</p>
                              <p className="text-xs text-muted-foreground">
                                Synced {integration.lastSync?.toLocaleTimeString()}
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Not connected</p>
                          )}
                        </div>
                      </div>
                      {integration.connected ? (
                        <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {integration.connected ? (
                        <>
                          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10 bg-transparent"
                            onClick={() => handleDisconnect(integration.id)}
                          >
                            Disconnect
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                          onClick={() => handleConnect(integration.id)}
                          disabled={isConnecting === integration.id}
                        >
                          {isConnecting === integration.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Connect
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* API Keys Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">API Configuration</CardTitle>
          <CardDescription>
            Manage API keys and webhooks for custom integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="api-key">Your API Key</Label>
              <div className="flex gap-2">
                <Input
                  id="api-key"
                  type="password"
                  value="sk_live_xxxxxxxxxxxxx"
                  readOnly
                  className="bg-input border-border font-mono"
                />
                <Button variant="outline">Copy</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Use this key to integrate NeuClix with your own applications
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook">Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook"
                  placeholder="https://your-app.com/webhook"
                  className="bg-input border-border"
                />
                <Button variant="outline">Save</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Receive real-time updates when content is published
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-card-foreground">Enable Webhooks</h4>
                <p className="text-sm text-muted-foreground">
                  Send notifications to your webhook URL
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card className="bg-card border-border">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-card-foreground">Need help with integrations?</h3>
              <p className="text-sm text-muted-foreground">
                Check our documentation for detailed setup guides
              </p>
            </div>
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              View Docs
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
