"use server"

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { streamText, generateText } from "ai"
import { LLM_PROVIDERS } from "@/lib/llm-providers"

// Universal AI endpoint that routes to user's configured provider
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      prompt, 
      messages,
      providerId, 
      modelId, 
      stream = true,
      systemPrompt,
      temperature = 0.7,
      maxTokens = 4096,
    } = body

    // Get user's provider configuration
    const { data: providerConfig } = await supabase
      .from("llm_providers")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider_id", providerId)
      .eq("is_active", true)
      .single()

    // Find provider info
    const provider = LLM_PROVIDERS.find(p => p.id === providerId)
    
    if (!provider) {
      return NextResponse.json({ error: "Provider not found" }, { status: 400 })
    }

    // Build the API configuration
    let apiKey = providerConfig?.api_key
    let baseUrl = providerConfig?.base_url || provider.baseUrl

    // For free providers or if no config, check if we can use defaults
    if (!apiKey && provider.authType !== "none") {
      // Check for platform-level API keys (environment variables)
      switch (providerId) {
        case "openrouter":
          apiKey = process.env.OPENROUTER_API_KEY
          break
        case "groq":
          apiKey = process.env.GROQ_API_KEY
          break
        case "together":
          apiKey = process.env.TOGETHER_API_KEY
          break
        case "perplexity":
          apiKey = process.env.PERPLEXITY_API_KEY
          break
        case "deepseek":
          apiKey = process.env.DEEPSEEK_API_KEY
          break
        case "cohere":
          apiKey = process.env.COHERE_API_KEY
          break
        case "mistral":
          apiKey = process.env.MISTRAL_API_KEY
          break
        case "fireworks":
          apiKey = process.env.FIREWORKS_API_KEY
          break
        case "cerebras":
          apiKey = process.env.CEREBRAS_API_KEY
          break
        case "huggingface":
          apiKey = process.env.HUGGINGFACE_API_KEY
          break
      }
    }

    if (!apiKey && provider.authType === "api_key") {
      return NextResponse.json({ 
        error: `Please configure your ${provider.name} API key in Connection Hub` 
      }, { status: 400 })
    }

    // Route to appropriate provider
    // Most providers use OpenAI-compatible API
    const modelString = getModelString(providerId, modelId, apiKey)
    
    if (stream) {
      const result = streamText({
        model: modelString,
        system: systemPrompt,
        messages: messages || [{ role: "user", content: prompt }],
        temperature,
        maxOutputTokens: maxTokens,
      })

      return result.toUIMessageStreamResponse()
    } else {
      const result = await generateText({
        model: modelString,
        system: systemPrompt,
        messages: messages || [{ role: "user", content: prompt }],
        temperature,
        maxOutputTokens: maxTokens,
      })

      return NextResponse.json({ 
        text: result.text,
        usage: result.usage,
      })
    }
  } catch (error) {
    console.error("[v0] Universal AI API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    )
  }
}

// Helper to build model string for AI SDK
function getModelString(providerId: string, modelId: string, apiKey?: string): string {
  // AI SDK uses provider/model format for gateway
  // For custom providers, we need to construct the appropriate model identifier
  
  switch (providerId) {
    case "openrouter":
      return `openrouter/${modelId}`
    case "groq":
      return `groq/${modelId}`
    case "together":
      return `togetherai/${modelId}`
    case "fireworks":
      return `fireworks/${modelId}`
    case "deepseek":
      return `deepseek/${modelId}`
    case "mistral":
      return `mistral/${modelId}`
    case "perplexity":
      return `perplexity/${modelId}`
    case "cohere":
      return `cohere/${modelId}`
    case "huggingface":
      return `huggingface/${modelId}`
    // For local providers, use custom provider setup
    case "ollama":
    case "lmstudio":
    case "llamacpp":
      // These require custom provider setup
      return `openai/${modelId}` // Fallback - would need custom provider
    default:
      return `openai/${modelId}`
  }
}
