import { streamText } from "ai"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { content } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const result = await streamText({
      model: "openai/gpt-4o-mini",
      system: `You are an expert content editor and SEO specialist. Your task is to refresh and improve the given content by:

1. Improving readability and flow
2. Adding relevant subheadings (H2, H3) for better structure
3. Shortening overly long sentences
4. Adding a compelling introduction and conclusion
5. Including relevant calls-to-action
6. Optimizing for SEO while keeping it natural
7. Updating any outdated information or statistics
8. Making the tone more engaging and professional

Output ONLY the refreshed content without any explanations or meta-commentary.`,
      prompt: `Please refresh and improve the following content:\n\n${content}`,
    })

    let refreshedContent = ""
    for await (const chunk of result.textStream) {
      refreshedContent += chunk
    }

    return NextResponse.json({ refreshedContent })
  } catch (error) {
    console.error("Error refreshing content:", error)
    return NextResponse.json(
      { error: "Failed to refresh content" },
      { status: 500 }
    )
  }
}
