import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@/lib/supabase-server'
import { Anthropic } from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, type } = await request.json()

    // Verify user is authenticated
    const supabase = await createServerComponentClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check subscription and usage limits
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan')
      .eq('user_id', user.id)
      .single()

    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Active subscription required' },
        { status: 403 }
      )
    }

    // Get usage for this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)

    const { data: usage } = await supabase
      .from('generation_history')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth.toISOString())

    const usageCount = usage?.length || 0
    const limits: Record<string, number> = {
      starter: 100,
      pro: 1000,
      agency: 99999,
    }

    const limit = limits[subscription.plan] || 100

    if (usageCount >= limit) {
      return NextResponse.json(
        { error: 'Monthly generation limit exceeded' },
        { status: 429 }
      )
    }

    // Call Claude API
    const systemPrompt = getSystemPrompt(type)
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: systemPrompt,
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to history
    await supabase.from('generation_history').insert({
      user_id: user.id,
      prompt,
      response: responseText,
      tokens_used: message.usage.input_tokens + message.usage.output_tokens,
    })

    return NextResponse.json({
      response: responseText,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
      usageCount: usageCount + 1,
      limit,
    })
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}

function getSystemPrompt(type: string): string {
  const prompts: Record<string, string> = {
    blog: 'You are a professional blog writer. Create engaging, well-structured blog posts that are optimized for both readers and search engines.',
    social: 'You are a social media expert. Create engaging, concise social media posts that drive engagement and conversation.',
    email: 'You are an email marketing specialist. Create compelling email copy that drives conversions and builds relationships.',
    ideas: 'You are a creative brainstorming expert. Generate innovative ideas that are actionable and inspiring.',
  }

  return (
    prompts[type] ||
    'You are a helpful content creation assistant. Provide high-quality, engaging content.'
  )
}
