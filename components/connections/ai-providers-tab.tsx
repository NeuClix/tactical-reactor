"use client"

import React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  CheckCircle,
  XCircle,
  Settings,
  ExternalLink,
  Plus,
  Loader2,
  Zap,
  Sparkles,
  Brain,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Star,
  Info,
  Globe,
  Server,
} from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface ConfiguredProvider {
  id: string
  provider_id: string
  api_key?: string
  base_url?: string
  default_model?: string
  enabled: boolean
  created_at: string
}

// Provider data (simplified for client)
const PROVIDERS = [
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Unified API for 300+ models, including 25+ free models",
    category: "freemium",
    freeLimit: "50 requests/day free",
    website: "https://openrouter.ai",
    docsUrl: "https://openrouter.ai/docs",
    models: [
      { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B (Free)", free: true },
      { id: "google/gemini-2.0-flash-exp:free", name: "Gemini 2.0 Flash (Free)", free: true },
      { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1 (Free)", free: true },
      { id: "qwen/qwen-2.5-72b-instruct:free", name: "Qwen 2.5 72B (Free)", free: true },
      { id: "mistralai/mistral-small-3.1-24b-instruct:free", name: "Mistral Small 3.1 (Free)", free: true },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    description: "Ultra-fast LLM inference - fastest in the world",
    category: "freemium",
    freeLimit: "14,400 requests/day free",
    website: "https://groq.com",
    docsUrl: "https://console.groq.com/docs",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B Versatile", free: true },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant", free: true },
      { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B", free: true },
      { id: "gemma2-9b-it", name: "Gemma 2 9B", free: true },
    ],
  },
  {
    id: "together",
    name: "Together AI",
    description: "Run open-source models with $25 free credits",
    category: "freemium",
    freeLimit: "$25 free credits",
    website: "https://together.ai",
    docsUrl: "https://docs.together.ai",
    models: [
      { id: "meta-llama/Llama-3.3-70B-Instruct-Turbo", name: "Llama 3.3 70B Turbo", free: false },
      { id: "deepseek-ai/DeepSeek-R1", name: "DeepSeek R1", free: false },
      { id: "Qwen/QwQ-32B-Preview", name: "QwQ 32B Preview", free: false },
    ],
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "Access thousands of open-source models",
    category: "freemium",
    freeLimit: "Rate-limited free tier",
    website: "https://huggingface.co",
    docsUrl: "https://huggingface.co/docs/api-inference",
    models: [
      { id: "meta-llama/Llama-3.3-70B-Instruct", name: "Llama 3.3 70B Instruct", free: true },
      { id: "mistralai/Mistral-7B-Instruct-v0.3", name: "Mistral 7B Instruct", free: true },
      { id: "HuggingFaceH4/zephyr-7b-beta", name: "Zephyr 7B", free: true },
    ],
  },
  {
    id: "ollama",
    name: "Ollama (Self-Hosted)",
    description: "Run LLMs locally - completely free, unlimited",
    category: "free",
    freeLimit: "Unlimited (self-hosted)",
    website: "https://ollama.ai",
    docsUrl: "https://github.com/ollama/ollama",
    models: [
      { id: "llama3.3:70b", name: "Llama 3.3 70B", free: true },
      { id: "llama3.2:3b", name: "Llama 3.2 3B", free: true },
      { id: "deepseek-r1:7b", name: "DeepSeek R1 7B", free: true },
      { id: "qwen2.5:7b", name: "Qwen 2.5 7B", free: true },
    ],
  },
  {
    id: "stanford-storm",
    name: "Stanford STORM",
    description: "Research-powered Wikipedia-style article generation",
    category: "free",
    freeLimit: "Free research preview",
    website: "https://storm.genie.stanford.edu",
    docsUrl: "https://github.com/stanford-oval/storm",
    models: [
      { id: "storm-article", name: "STORM Article Generator", free: true },
    ],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    description: "AI-powered search with real-time information",
    category: "freemium",
    freeLimit: "Limited free searches",
    website: "https://perplexity.ai",
    docsUrl: "https://docs.perplexity.ai",
    models: [
      { id: "llama-3.1-sonar-small-128k-online", name: "Sonar Small (Online)", free: false },
      { id: "llama-3.1-sonar-large-128k-online", name: "Sonar Large (Online)", free: false },
    ],
  },
  {
    id: "fireworks",
    name: "Fireworks AI",
    description: "Fast inference for open models",
    category: "freemium",
    freeLimit: "$1 free credits",
    website: "https://fireworks.ai",
    docsUrl: "https://docs.fireworks.ai",
    models: [
      { id: "accounts/fireworks/models/llama-v3p3-70b-instruct", name: "Llama 3.3 70B", free: false },
      { id: "accounts/fireworks/models/deepseek-r1", name: "DeepSeek R1", free: false },
    ],
  },
]

export function AIProvidersTab() {
  const [configuredProviders, setConfiguredProviders] = useState<ConfiguredProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState<typeof PROVIDERS[0] | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [baseUrl, setBaseUrl] = useState("")
  const [defaultModel, setDefaultModel] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [defaultProvider, setDefaultProvider] = useState<string>("")

  const supabase = createClient()

  useEffect(() => {
    loadConfiguredProviders()
  }, [])

  const loadConfiguredProviders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (company) {
        const { data: providers } = await supabase
          .from("llm_providers")
          .select("*")
          .eq("company_id", company.id)

        if (providers) {
          setConfiguredProviders(providers)
          const defaultProv = providers.find(p => p.is_default)
          if (defaultProv) setDefaultProvider(defaultProv.provider_id)
        }
      }
    } catch (error) {
      console.error("Error loading providers:", error)
    } finally {
      setLoading(false)
    }
  }

  const openConfigDialog = (provider: typeof PROVIDERS[0]) => {
    setSelectedProvider(provider)
    const existing = configuredProviders.find(p => p.provider_id === provider.id)
    if (existing) {
      setApiKey(existing.api_key || "")
      setBaseUrl(existing.base_url || "")
      setDefaultModel(existing.default_model || provider.models[0]?.id || "")
    } else {
      setApiKey("")
      setBaseUrl(provider.id === "ollama" ? "http://localhost:11434/api" : "")
      setDefaultModel(provider.models[0]?.id || "")
    }
    setConfigDialogOpen(true)
  }

  const saveProvider = async () => {
    if (!selectedProvider) return
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (!company) throw new Error("Company not found")

      const existing = configuredProviders.find(p => p.provider_id === selectedProvider.id)

      if (existing) {
        await supabase
          .from("llm_providers")
          .update({
            api_key: apiKey || null,
            base_url: baseUrl || null,
            default_model: defaultModel,
            enabled: true,
          })
          .eq("id", existing.id)
      } else {
        await supabase
          .from("llm_providers")
          .insert({
            company_id: company.id,
            provider_id: selectedProvider.id,
            api_key: apiKey || null,
            base_url: baseUrl || null,
            default_model: defaultModel,
            enabled: true,
          })
      }

      toast.success(`${selectedProvider.name} configured successfully`)
      setConfigDialogOpen(false)
      loadConfiguredProviders()
    } catch (error) {
      toast.error("Failed to save provider configuration")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const testConnection = async () => {
    if (!selectedProvider) return
    setTesting(true)

    try {
      const response = await fetch("/api/ai/test-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider.id,
          apiKey,
          baseUrl,
          model: defaultModel,
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success("Connection successful!")
      } else {
        toast.error(result.error || "Connection failed")
      }
    } catch {
      toast.error("Failed to test connection")
    } finally {
      setTesting(false)
    }
  }

  const removeProvider = async (providerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (company) {
        await supabase
          .from("llm_providers")
          .delete()
          .eq("company_id", company.id)
          .eq("provider_id", providerId)

        toast.success("Provider removed")
        loadConfiguredProviders()
      }
    } catch {
      toast.error("Failed to remove provider")
    }
  }

  const setAsDefault = async (providerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (company) {
        // Remove default from all
        await supabase
          .from("llm_providers")
          .update({ is_default: false })
          .eq("company_id", company.id)

        // Set new default
        await supabase
          .from("llm_providers")
          .update({ is_default: true })
          .eq("company_id", company.id)
          .eq("provider_id", providerId)

        setDefaultProvider(providerId)
        toast.success("Default provider updated")
      }
    } catch {
      toast.error("Failed to set default provider")
    }
  }

  const isConfigured = (providerId: string) => 
    configuredProviders.some(p => p.provider_id === providerId && p.enabled)

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "free":
        return <Badge className="bg-green-600/20 text-green-400 border-green-600/30">100% Free</Badge>
      case "freemium":
        return <Badge className="bg-blue-600/20 text-blue-400 border-blue-600/30">Free Tier</Badge>
      default:
        return <Badge variant="secondary">Paid</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI / LLM Providers</h2>
          <p className="text-sm text-muted-foreground">
            Connect free and open-source AI models to power your content generation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Sparkles className="w-3 h-3" />
            {configuredProviders.filter(p => p.enabled).length} Active
          </Badge>
        </div>
      </div>

      {/* Recommended Free Providers */}
      <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-600/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-400" />
            Recommended Free Options
          </CardTitle>
          <CardDescription>
            Start generating content for free with these providers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {PROVIDERS.filter(p => p.category === "free" || p.id === "groq" || p.id === "openrouter").slice(0, 3).map(provider => (
              <div
                key={provider.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isConfigured(provider.id)
                    ? "bg-green-600/10 border-green-600/30"
                    : "bg-card/50 border-border hover:border-primary/50"
                }`}
                onClick={() => openConfigDialog(provider)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">{provider.name}</span>
                  {isConfigured(provider.id) && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">{provider.freeLimit}</p>
                <Button 
                  size="sm" 
                  variant={isConfigured(provider.id) ? "outline" : "default"}
                  className="w-full"
                >
                  {isConfigured(provider.id) ? "Configure" : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Providers */}
      <Accordion type="multiple" defaultValue={["configured", "available"]} className="space-y-4">
        {/* Configured Providers */}
        {configuredProviders.length > 0 && (
          <AccordionItem value="configured" className="border border-border rounded-lg bg-card">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Configured Providers ({configuredProviders.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid gap-3">
                {configuredProviders.map(config => {
                  const provider = PROVIDERS.find(p => p.id === config.provider_id)
                  if (!provider) return null
                  
                  return (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">{provider.name}</h3>
                            {defaultProvider === provider.id && (
                              <Badge className="bg-primary/20 text-primary text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Model: {config.default_model || "Not set"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAsDefault(provider.id)}
                          disabled={defaultProvider === provider.id}
                        >
                          <Star className={`w-4 h-4 ${defaultProvider === provider.id ? "fill-primary text-primary" : ""}`} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openConfigDialog(provider)}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeProvider(provider.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Available Providers */}
        <AccordionItem value="available" className="border border-border rounded-lg bg-card">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-muted-foreground" />
              <span>All Available Providers ({PROVIDERS.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <div className="grid gap-3 md:grid-cols-2">
              {PROVIDERS.map(provider => (
                <Card 
                  key={provider.id} 
                  className={`bg-card/50 border-border transition-all hover:border-primary/50 ${
                    isConfigured(provider.id) ? "ring-1 ring-green-600/30" : ""
                  }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          provider.id === "ollama" ? "bg-muted" : "bg-primary/20"
                        }`}>
                          {provider.id === "ollama" ? (
                            <Server className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Brain className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{provider.name}</h3>
                          {getCategoryBadge(provider.category)}
                        </div>
                      </div>
                      {isConfigured(provider.id) && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {provider.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {provider.models.length} models
                      </Badge>
                      <Badge variant="outline" className="text-xs text-green-400 border-green-600/30">
                        {provider.freeLimit}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        className="flex-1"
                        variant={isConfigured(provider.id) ? "outline" : "default"}
                        onClick={() => openConfigDialog(provider)}
                      >
                        {isConfigured(provider.id) ? (
                          <>
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Connect
                          </>
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => window.open(provider.website, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Brain className="w-5 h-5 text-primary" />
              Configure {selectedProvider?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedProvider?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Info Banner */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-600/10 border border-blue-600/30">
              <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-300 font-medium">{selectedProvider?.freeLimit}</p>
                <a 
                  href={selectedProvider?.docsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1 mt-1"
                >
                  View documentation <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* API Key (if required) */}
            {selectedProvider?.id !== "ollama" && selectedProvider?.id !== "stanford-storm" && (
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="api-key"
                      type={showApiKey ? "text" : "password"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                      className="bg-input border-border pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a 
                    href={selectedProvider?.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {selectedProvider?.name}
                  </a>
                </p>
              </div>
            )}

            {/* Base URL (for self-hosted) */}
            {selectedProvider?.id === "ollama" && (
              <div className="space-y-2">
                <Label htmlFor="base-url">Ollama Server URL</Label>
                <Input
                  id="base-url"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="http://localhost:11434/api"
                  className="bg-input border-border"
                />
                <p className="text-xs text-muted-foreground">
                  Default is http://localhost:11434/api. Change if running on a different host.
                </p>
              </div>
            )}

            {/* Default Model */}
            <div className="space-y-2">
              <Label htmlFor="model">Default Model</Label>
              <Select value={defaultModel} onValueChange={setDefaultModel}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider?.models.map(model => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center gap-2">
                        {model.name}
                        {model.free && (
                          <Badge variant="outline" className="text-xs text-green-400 border-green-600/30">
                            Free
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={testing || (!apiKey && selectedProvider?.id !== "ollama" && selectedProvider?.id !== "stanford-storm")}
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
            <Button onClick={saveProvider} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Configuration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
