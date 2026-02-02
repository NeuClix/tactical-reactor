"use server"

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { type PlatformId } from "@/lib/platform-connections"

// Handle OAuth callback from platforms
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params
  const platformId = platform as PlatformId
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/dashboard/connections?error=${encodeURIComponent(error)}`,
        request.url
      )
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=missing_params", request.url)
    )
  }

  // Decode state
  let stateData: { companyId: string; platform: string }
  try {
    stateData = JSON.parse(Buffer.from(state, "base64").toString())
  } catch {
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=invalid_state", request.url)
    )
  }

  const supabase = await createClient()
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin}/api/connections/callback/${platformId}`

  let tokenData: {
    access_token: string
    refresh_token?: string
    expires_in?: number
    token_type?: string
  }
  let accountInfo: {
    account_id: string
    account_name: string
    account_username?: string
    profile_image_url?: string
  }

  try {
    switch (platformId) {
      case "facebook":
      case "instagram": {
        const fbResponse = await fetch(
          `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${process.env.FACEBOOK_APP_SECRET}&code=${code}`
        )
        tokenData = await fbResponse.json()

        // Get user info
        const userResponse = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=id,name,picture&access_token=${tokenData.access_token}`
        )
        const userData = await userResponse.json()
        accountInfo = {
          account_id: userData.id,
          account_name: userData.name,
          profile_image_url: userData.picture?.data?.url,
        }
        break
      }

      case "twitter": {
        const twitterResponse = await fetch(
          "https://api.twitter.com/2/oauth2/token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${Buffer.from(`${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`).toString("base64")}`,
            },
            body: new URLSearchParams({
              code,
              grant_type: "authorization_code",
              redirect_uri: redirectUri,
              code_verifier: "challenge",
            }),
          }
        )
        tokenData = await twitterResponse.json()

        // Get user info
        const userResponse = await fetch(
          "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
          {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          }
        )
        const userData = await userResponse.json()
        accountInfo = {
          account_id: userData.data.id,
          account_name: userData.data.name,
          account_username: userData.data.username,
          profile_image_url: userData.data.profile_image_url,
        }
        break
      }

      case "linkedin": {
        const linkedinResponse = await fetch(
          "https://www.linkedin.com/oauth/v2/accessToken",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "authorization_code",
              code,
              redirect_uri: redirectUri,
              client_id: process.env.LINKEDIN_CLIENT_ID!,
              client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
            }),
          }
        )
        tokenData = await linkedinResponse.json()

        // Get user info
        const userResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        })
        const userData = await userResponse.json()
        accountInfo = {
          account_id: userData.sub,
          account_name: userData.name,
          profile_image_url: userData.picture,
        }
        break
      }

      case "youtube": {
        const googleResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
          }),
        })
        tokenData = await googleResponse.json()

        // Get channel info
        const channelResponse = await fetch(
          "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
          {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          }
        )
        const channelData = await channelResponse.json()
        const channel = channelData.items?.[0]
        accountInfo = {
          account_id: channel?.id || "unknown",
          account_name: channel?.snippet?.title || "YouTube Channel",
          profile_image_url: channel?.snippet?.thumbnails?.default?.url,
        }
        break
      }

      case "tiktok": {
        const tiktokResponse = await fetch(
          "https://open.tiktokapis.com/v2/oauth/token/",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_key: process.env.TIKTOK_CLIENT_KEY!,
              client_secret: process.env.TIKTOK_CLIENT_SECRET!,
              code,
              grant_type: "authorization_code",
              redirect_uri: redirectUri,
            }),
          }
        )
        tokenData = await tiktokResponse.json()

        // Get user info
        const userResponse = await fetch(
          "https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url",
          {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          }
        )
        const userData = await userResponse.json()
        accountInfo = {
          account_id: userData.data?.user?.open_id || "unknown",
          account_name: userData.data?.user?.display_name || "TikTok User",
          profile_image_url: userData.data?.user?.avatar_url,
        }
        break
      }

      default:
        return NextResponse.redirect(
          new URL("/dashboard/connections?error=unsupported_platform", request.url)
        )
    }

    // Calculate token expiry
    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null

    // Store connection in database
    const { error: dbError } = await supabase.from("platform_connections").upsert(
      {
        company_id: stateData.companyId,
        platform_id: platformId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: expiresAt,
        account_id: accountInfo.account_id,
        account_name: accountInfo.account_name,
        account_username: accountInfo.account_username || null,
        profile_image_url: accountInfo.profile_image_url || null,
        is_active: true,
        scopes: [],
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "company_id,platform_id",
      }
    )

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.redirect(
        new URL("/dashboard/connections?error=db_error", request.url)
      )
    }

    return NextResponse.redirect(
      new URL(
        `/dashboard/connections?success=${platformId}&name=${encodeURIComponent(accountInfo.account_name)}`,
        request.url
      )
    )
  } catch (err) {
    console.error("OAuth error:", err)
    return NextResponse.redirect(
      new URL("/dashboard/connections?error=oauth_failed", request.url)
    )
  }
}
