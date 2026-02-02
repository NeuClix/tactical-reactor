"use server"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PLATFORMS, type PlatformId } from "@/lib/platform-connections"

// Initiate OAuth flow for a platform
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const platformId = platform as PlatformId
  const platformConfig = PLATFORMS.find((p) => p.id === platformId)

  if (!platformConfig) {
    return NextResponse.json({ error: "Platform not found" }, { status: 404 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Get the company ID
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  // Build OAuth URL based on platform
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/connections/callback/${platformId}`
  const state = Buffer.from(
    JSON.stringify({ companyId: company.id, platform: platformId })
  ).toString("base64")

  let authUrl: string

  switch (platformId) {
    case "facebook":
    case "instagram":
      // Meta (Facebook/Instagram) OAuth
      const fbClientId = process.env.FACEBOOK_APP_ID
      if (!fbClientId) {
        return NextResponse.redirect(
          new URL(`/dashboard/connections?error=facebook_not_configured&message=Facebook+OAuth+not+set+up.+Add+FACEBOOK_APP_ID+to+enable.`, request.url)
        )
      }
      const fbScopes =
        platformId === "instagram"
          ? "instagram_basic,instagram_content_publish,pages_show_list"
          : "pages_show_list,pages_read_engagement,pages_manage_posts"
      authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${fbClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${fbScopes}&state=${state}`
      break

    case "twitter":
      // Twitter OAuth 2.0
      const twitterClientId = process.env.TWITTER_CLIENT_ID
      if (!twitterClientId) {
        return NextResponse.redirect(
          new URL(`/dashboard/connections?error=twitter_not_configured&message=Twitter+OAuth+not+set+up.+Add+TWITTER_CLIENT_ID+to+enable.`, request.url)
        )
      }
      const twitterScopes = "tweet.read tweet.write users.read offline.access"
      authUrl = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(twitterScopes)}&state=${state}&code_challenge=challenge&code_challenge_method=plain`
      break

    case "linkedin":
      // LinkedIn OAuth 2.0
      const linkedinClientId = process.env.LINKEDIN_CLIENT_ID
      if (!linkedinClientId) {
        return NextResponse.redirect(
          new URL(`/dashboard/connections?error=linkedin_not_configured&message=LinkedIn+OAuth+not+set+up.+Add+LINKEDIN_CLIENT_ID+to+enable.`, request.url)
        )
      }
      const linkedinScopes = "openid profile email w_member_social"
      authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${linkedinClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(linkedinScopes)}&state=${state}`
      break

    case "youtube":
      // Google/YouTube OAuth 2.0
      const googleClientId = process.env.GOOGLE_CLIENT_ID
      if (!googleClientId) {
        return NextResponse.redirect(
          new URL(`/dashboard/connections?error=google_not_configured&message=Google+OAuth+not+set+up.+Add+GOOGLE_CLIENT_ID+to+enable.`, request.url)
        )
      }
      const youtubeScopes =
        "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube"
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(youtubeScopes)}&state=${state}&access_type=offline&prompt=consent`
      break

    case "tiktok":
      // TikTok OAuth 2.0
      const tiktokClientKey = process.env.TIKTOK_CLIENT_KEY
      if (!tiktokClientKey) {
        return NextResponse.redirect(
          new URL(`/dashboard/connections?error=tiktok_not_configured&message=TikTok+OAuth+not+set+up.+Add+TIKTOK_CLIENT_KEY+to+enable.`, request.url)
        )
      }
      const tiktokScopes = "user.info.basic,video.list,video.upload"
      authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${tiktokClientKey}&response_type=code&scope=${tiktokScopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
      break

    default:
      return NextResponse.json(
        { error: "OAuth not supported for this platform" },
        { status: 400 }
      )
  }

  return NextResponse.redirect(authUrl)
}
