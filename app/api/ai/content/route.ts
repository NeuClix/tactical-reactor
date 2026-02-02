import { streamText, Output } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const { prompt, brandContext, contentType } = await req.json()

  // Get user's brand profile context
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const systemPrompt = `You are an expert SEO content writer and marketing specialist. 
Your task is to create high-quality, engaging content that is optimized for search engines.

${brandContext ? `Brand Context:
${brandContext.companyInfo || ""}
${brandContext.brandVoice ? `Voice & Tone: ${brandContext.brandVoice}` : ""}
${brandContext.targetAudience ? `Target Audience: ${brandContext.targetAudience}` : ""}
${brandContext.uniqueValue ? `Unique Value: ${brandContext.uniqueValue}` : ""}
${brandContext.coreKeywords ? `Core Keywords to include: ${brandContext.coreKeywords.join(", ")}` : ""}
${brandContext.customInstructions ? `Additional Instructions: ${brandContext.customInstructions}` : ""}
` : ""}

Content Type: ${contentType || "blog post"}

Guidelines:
- Write compelling, original content
- Include relevant keywords naturally
- Use proper heading hierarchy (H1, H2, H3)
- Include a meta title (under 60 characters) and meta description (under 160 characters)
- Make the content engaging and valuable to readers
- Format with markdown`

  const result = streamText({
    model: "openai/gpt-4o",
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
    maxOutputTokens: 4000,
  })

  return result.toUIMessageStreamResponse()
}
