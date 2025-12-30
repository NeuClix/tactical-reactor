import { createServerComponentClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

const sampleArticles = [
  {
    title: 'Getting Started with AI Content Generation',
    content: 'Artificial intelligence has revolutionized how we create content. In this comprehensive guide, we explore the fundamentals of AI-powered content generation and how it can transform your marketing strategy. From blog posts to social media updates, AI tools are becoming indispensable for modern content creators.',
    content_type: 'blog' as const,
    status: 'published' as const,
  },
  {
    title: 'Q4 Marketing Campaign Announcement',
    content: 'Exciting news! Our Q4 marketing campaign is launching next week. Get ready for exclusive offers, new product reveals, and special promotions. Stay tuned for more updates!',
    content_type: 'social' as const,
    status: 'published' as const,
  },
  {
    title: 'Welcome to Our Newsletter',
    content: 'Dear valued subscriber, thank you for joining our community! Each week, we will bring you the latest insights, tips, and exclusive content directly to your inbox. We are thrilled to have you on this journey with us.',
    content_type: 'email' as const,
    status: 'draft' as const,
  },
  {
    title: 'About Us - Company Overview',
    content: 'We are a forward-thinking technology company dedicated to empowering businesses with cutting-edge AI solutions. Founded in 2024, our mission is to democratize artificial intelligence and make it accessible to organizations of all sizes.',
    content_type: 'page' as const,
    status: 'published' as const,
  },
  {
    title: '10 Tips for Better Social Media Engagement',
    content: 'Want to boost your social media presence? Here are ten proven strategies to increase engagement and grow your audience. From optimal posting times to content formats that resonate, we cover everything you need to know.',
    content_type: 'blog' as const,
    status: 'published' as const,
  },
  {
    title: 'Flash Sale - 24 Hours Only!',
    content: 'FLASH SALE ALERT! For the next 24 hours, enjoy 50% off all premium features. Use code FLASH50 at checkout. Limited time offer - dont miss out!',
    content_type: 'social' as const,
    status: 'draft' as const,
  },
  {
    title: 'Monthly Product Update - December 2024',
    content: 'Hello! We have been busy this month adding new features and improvements. Check out what is new: enhanced AI models, faster processing times, and a refreshed user interface. Read on for the full changelog.',
    content_type: 'email' as const,
    status: 'published' as const,
  },
  {
    title: 'Privacy Policy',
    content: 'Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information when you use our services. We are committed to maintaining the trust and confidence of our users.',
    content_type: 'page' as const,
    status: 'published' as const,
  },
  {
    title: 'The Future of Content Marketing in 2025',
    content: 'As we approach 2025, the content marketing landscape continues to evolve rapidly. AI-driven personalization, interactive content, and video-first strategies are reshaping how brands connect with their audiences. Here is what you need to prepare for.',
    content_type: 'blog' as const,
    status: 'draft' as const,
  },
  {
    title: 'Customer Success Story: TechCorp',
    content: 'See how TechCorp increased their content output by 300% using our platform. From struggling with content consistency to becoming an industry thought leader, their transformation is truly inspiring. Read the full case study.',
    content_type: 'blog' as const,
    status: 'published' as const,
  },
]

export async function POST() {
  try {
    const supabase = await createServerComponentClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Add user_id and randomize dates
    const now = new Date()
    const articlesWithUser = sampleArticles.map((article, index) => {
      // Spread dates over the last 30 days
      const daysAgo = Math.floor(Math.random() * 30)
      const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)

      return {
        ...article,
        user_id: user.id,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
      }
    })

    const { data, error } = await supabase
      .from('content_items')
      .insert(articlesWithUser)
      .select()

    if (error) {
      console.error('Seed error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: `Successfully created ${data.length} articles`,
      count: data.length
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed content' }, { status: 500 })
  }
}
