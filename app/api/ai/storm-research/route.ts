"use server"

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { streamText } from "ai"

// STORM-inspired research endpoint
// This creates Wikipedia-style comprehensive reports using multi-perspective research
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      topic, 
      depth = "comprehensive", // "quick" | "standard" | "comprehensive"
      style = "wikipedia", // "wikipedia" | "blog" | "academic" | "news"
      providerId = "openai",
      modelId = "gpt-4o",
    } = body

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
    }

    // Get user's company for brand context
    const { data: company } = await supabase
      .from("companies")
      .select("company_name")
      .eq("user_id", user.id)
      .single()

    // Get active brand profile for context
    const { data: brandProfile } = await supabase
      .from("brand_profiles")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single()

    // Build STORM-inspired system prompt
    const systemPrompt = buildSTORMSystemPrompt(style, depth, brandProfile)

    // Use the STORM methodology:
    // 1. Perspective gathering - identify different viewpoints
    // 2. Question generation - create comprehensive questions
    // 3. Research synthesis - combine into coherent article
    // 4. Citation management - attribute sources properly
    
    const researchPrompt = buildSTORMResearchPrompt(topic, depth, style)

    // Use the configured model or default
    const modelString = `${providerId}/${modelId}`

    const result = streamText({
      model: modelString,
      system: systemPrompt,
      messages: [{ role: "user", content: researchPrompt }],
      temperature: 0.7,
      maxOutputTokens: depth === "comprehensive" ? 8192 : depth === "standard" ? 4096 : 2048,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error("[v0] STORM Research API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process request" },
      { status: 500 }
    )
  }
}

function buildSTORMSystemPrompt(
  style: string, 
  depth: string, 
  brandProfile?: { voice_tone?: string; writing_style?: string; core_keywords?: string }
): string {
  const styleGuides: Record<string, string> = {
    wikipedia: `You write in an encyclopedic, neutral tone with comprehensive coverage. Use clear section headings, include relevant context, and maintain a formal but accessible style.`,
    blog: `You write engaging blog content that educates and entertains. Use conversational language, include practical examples, and break up text with subheadings.`,
    academic: `You write in formal academic style with precise language. Include theoretical frameworks, methodology considerations, and proper citation formats.`,
    news: `You write in journalistic style - clear, concise, and factual. Lead with the most important information and provide balanced perspectives.`,
  }

  const depthGuides: Record<string, string> = {
    quick: "Provide a concise overview (500-800 words) covering the key points.",
    standard: "Provide a thorough article (1500-2500 words) with good depth on main topics.",
    comprehensive: "Provide an in-depth, Wikipedia-style article (3000-5000 words) covering all aspects comprehensively.",
  }

  let brandContext = ""
  if (brandProfile) {
    brandContext = `
Brand Context:
- Voice/Tone: ${brandProfile.voice_tone || "Professional and informative"}
- Writing Style: ${brandProfile.writing_style || "Clear and engaging"}
- Keywords to incorporate naturally: ${brandProfile.core_keywords || "N/A"}
`
  }

  return `You are an expert research writer using the STORM methodology (Synthesis of Topic Outlines through Retrieval and Multi-perspective Question Asking).

Your Approach:
1. **Multi-Perspective Research**: Consider the topic from multiple expert viewpoints
2. **Comprehensive Coverage**: Ensure all important aspects are covered
3. **Structured Organization**: Use clear hierarchical structure with sections
4. **Evidence-Based**: Ground claims in facts and provide context for sources
5. **Quality Writing**: Produce polished, publication-ready content

Style Guide:
${styleGuides[style] || styleGuides.wikipedia}

Depth Requirement:
${depthGuides[depth] || depthGuides.standard}
${brandContext}

Format your response with:
- A compelling title
- Clear section headings (use ## for main sections, ### for subsections)
- Bullet points where appropriate
- A summary/conclusion section
- Suggested sources/further reading at the end`
}

function buildSTORMResearchPrompt(topic: string, depth: string, style: string): string {
  return `Research and write a ${depth} ${style}-style article on the following topic:

**Topic:** ${topic}

Using the STORM methodology:

1. **Identify Perspectives**: What are the key viewpoints and expert perspectives relevant to this topic?

2. **Generate Research Questions**: What are the most important questions someone researching this topic would want answered?

3. **Synthesize Knowledge**: Combine insights from multiple perspectives into a coherent, well-structured article.

4. **Structure the Content**: Organize the article with clear sections that flow logically.

Please write the complete article now, incorporating all perspectives and ensuring comprehensive coverage.`
}
