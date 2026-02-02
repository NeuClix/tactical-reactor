import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const { text: enhancedPrompt } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are an expert at writing image generation prompts. Take the user's basic prompt and enhance it with:
- More specific visual details
- Professional photography terms (lighting, composition, etc.)
- Style descriptors (cinematic, professional, modern, etc.)
- Color palette suggestions
- Mood and atmosphere descriptions

Keep the enhanced prompt concise but descriptive (max 150 words). Output ONLY the enhanced prompt, no explanations.`,
      prompt: `Enhance this image prompt: "${prompt}"`,
    })

    return NextResponse.json({ enhancedPrompt })
  } catch (error) {
    console.error("Error enhancing prompt:", error)
    return NextResponse.json(
      { error: "Failed to enhance prompt" },
      { status: 500 }
    )
  }
}
