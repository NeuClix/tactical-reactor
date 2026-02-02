"use server"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { type PlatformId } from "@/lib/platform-connections"

interface PublishRequest {
  content: string
  title?: string
  platforms: PlatformId[]
  mediaUrls?: string[]
  scheduledFor?: string
}

// Publish content to connected platforms
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const body: PublishRequest = await request.json()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Get company
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  // If scheduled for later, create scheduled post
  if (body.scheduledFor) {
    const { data: scheduledPost, error } = await supabase
      .from("scheduled_posts")
      .insert({
        company_id: company.id,
        content: body.content,
        title: body.title,
        platforms: body.platforms,
        media_urls: body.mediaUrls || [],
        scheduled_for: body.scheduledFor,
        status: "scheduled",
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      scheduled: true,
      post: scheduledPost,
    })
  }

  // Publish immediately to each platform
  const results: {
    platform: string
    success: boolean
    error?: string
    postId?: string
  }[] = []

  for (const platformId of body.platforms) {
    // Get connection for this platform
    const { data: connection } = await supabase
      .from("platform_connections")
      .select("*")
      .eq("company_id", company.id)
      .eq("platform_id", platformId)
      .eq("is_active", true)
      .single()

    if (!connection) {
      results.push({
        platform: platformId,
        success: false,
        error: "Platform not connected",
      })
      continue
    }

    try {
      let postResult: { postId?: string; error?: string }

      switch (platformId) {
        case "facebook":
          postResult = await publishToFacebook(connection, body.content, body.mediaUrls)
          break
        case "twitter":
          postResult = await publishToTwitter(connection, body.content, body.mediaUrls)
          break
        case "linkedin":
          postResult = await publishToLinkedIn(connection, body.content, body.mediaUrls)
          break
        case "instagram":
          postResult = await publishToInstagram(connection, body.content, body.mediaUrls)
          break
        default:
          postResult = { error: "Platform publishing not implemented" }
      }

      if (postResult.error) {
        results.push({
          platform: platformId,
          success: false,
          error: postResult.error,
        })
      } else {
        results.push({
          platform: platformId,
          success: true,
          postId: postResult.postId,
        })

        // Log successful publish
        await supabase.from("publish_log").insert({
          company_id: company.id,
          platform_id: platformId,
          content: body.content,
          post_id: postResult.postId,
          status: "published",
        })
      }
    } catch (err) {
      results.push({
        platform: platformId,
        success: false,
        error: err instanceof Error ? err.message : "Unknown error",
      })
    }
  }

  return NextResponse.json({
    success: results.some((r) => r.success),
    results,
  })
}

// Platform-specific publish functions
async function publishToFacebook(
  connection: { access_token: string; account_id: string },
  content: string,
  mediaUrls?: string[]
) {
  try {
    // First get pages the user manages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${connection.access_token}`
    )
    const pagesData = await pagesResponse.json()

    if (!pagesData.data?.[0]) {
      return { error: "No Facebook pages found" }
    }

    const page = pagesData.data[0]
    const pageAccessToken = page.access_token

    // Post to the page
    const postResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          access_token: pageAccessToken,
          ...(mediaUrls?.[0] && { link: mediaUrls[0] }),
        }),
      }
    )

    const postData = await postResponse.json()

    if (postData.error) {
      return { error: postData.error.message }
    }

    return { postId: postData.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to post to Facebook" }
  }
}

async function publishToTwitter(
  connection: { access_token: string },
  content: string,
  _mediaUrls?: string[]
) {
  try {
    const response = await fetch("https://api.twitter.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${connection.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: content }),
    })

    const data = await response.json()

    if (data.errors) {
      return { error: data.errors[0]?.message || "Twitter API error" }
    }

    return { postId: data.data?.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to post to Twitter" }
  }
}

async function publishToLinkedIn(
  connection: { access_token: string; account_id: string },
  content: string,
  _mediaUrls?: string[]
) {
  try {
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${connection.access_token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${connection.account_id}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: content },
            shareMediaCategory: "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      }),
    })

    const data = await response.json()

    if (response.status !== 201) {
      return { error: data.message || "LinkedIn API error" }
    }

    return { postId: data.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to post to LinkedIn" }
  }
}

async function publishToInstagram(
  connection: { access_token: string },
  content: string,
  mediaUrls?: string[]
) {
  try {
    if (!mediaUrls?.[0]) {
      return { error: "Instagram requires an image to post" }
    }

    // Get Instagram business account ID
    const accountsResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${connection.access_token}`
    )
    const accountsData = await accountsResponse.json()
    const page = accountsData.data?.[0]

    if (!page) {
      return { error: "No connected Instagram account found" }
    }

    // Get Instagram account ID
    const igResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${connection.access_token}`
    )
    const igData = await igResponse.json()
    const igAccountId = igData.instagram_business_account?.id

    if (!igAccountId) {
      return { error: "No Instagram business account linked" }
    }

    // Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: mediaUrls[0],
          caption: content,
          access_token: page.access_token,
        }),
      }
    )
    const containerData = await containerResponse.json()

    if (containerData.error) {
      return { error: containerData.error.message }
    }

    // Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: page.access_token,
        }),
      }
    )
    const publishData = await publishResponse.json()

    if (publishData.error) {
      return { error: publishData.error.message }
    }

    return { postId: publishData.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to post to Instagram" }
  }
}
