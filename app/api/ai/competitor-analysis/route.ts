import { generateText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      system: `You are a competitive intelligence analyst. Analyze the given competitor URL and provide insights. Return a JSON object with this exact structure:
{
  "domain": "the competitor domain",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "keywords": ["keyword 1", "keyword 2", "keyword 3"]
}

Base your analysis on common patterns for similar businesses. Be specific and actionable in your insights.`,
      prompt: `Analyze this competitor: ${url}`,
    })

    try {
      const analysis = JSON.parse(text)
      return NextResponse.json({
        id: Date.now().toString(),
        ...analysis,
        analyzedAt: new Date(),
      })
    } catch {
      return NextResponse.json(
        { error: "Failed to parse analysis" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error analyzing competitor:", error)
    return NextResponse.json(
      { error: "Failed to analyze competitor" },
      { status: 500 }
    )
  }
}
