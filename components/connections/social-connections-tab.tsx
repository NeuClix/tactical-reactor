"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Trash2,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { PLATFORMS, PLATFORM_ICONS, type PlatformId } from "@/lib/platform-connections"
import useSWR from "swr"
import Image from "next/image"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PlatformConnection {
  id: string
  platform_id: PlatformId
  account_name: string
  account_username?: string
  profile_image_url?: string
  is_active: boolean
  token_expires_at?: string
  created_at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
}

export function SocialConnectionsTab() {
  const { data, error, isLoading, mutate } = useSWR<{ connections: PlatformConnection[] }>(
    "/api/connections",
    fetcher
  )
  const [connecting, setConnecting] = useState<string | null>(null)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [confirmDisconnect, setConfirmDisconnect] = useState<PlatformConnection | null>(null)

  // Check URL params for success/error messages
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const success = params.get("success")
    const name = params.get("name")
    const errorParam = params.get("error")
    const message = params.get("message")

    if (success && name) {
      toast.success(`Connected ${name} successfully!`)
      mutate()
      // Clean URL
      window.history.replaceState({}, "", "/dashboard/connections")
    } else if (errorParam) {
      // Show user-friendly message
      const friendlyMessage = message 
        ? decodeURIComponent(message.replace(/\+/g, " "))
        : `Connection failed: ${errorParam.replace(/_/g, " ")}`
      toast.error(friendlyMessage, { duration: 5000 })
      window.history.replaceState({}, "", "/dashboard/connections")
    }
  }, [mutate])

  const socialPlatforms = PLATFORMS.filter((p) => p.category === "social")
  const connections = data?.connections || []

  const handleConnect = (platformId: string) => {
    setConnecting(platformId)
    // Redirect to OAuth flow
    window.location.href = `/api/connections/oauth/${platformId}`
  }

  const handleDisconnect = async (connection: PlatformConnection) => {
    setDisconnecting(connection.platform_id)
    try {
      const response = await fetch("/api/connections", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformId: connection.platform_id }),
      })

      if (response.ok) {
        toast.success(`Disconnected ${connection.account_name}`)
        mutate()
      } else {
        toast.error("Failed to disconnect")
      }
    } catch {
      toast.error("Failed to disconnect")
    } finally {
      setDisconnecting(null)
      setConfirmDisconnect(null)
    }
  }

  const getConnection = (platformId: string) => {
    return connections.find((c) => c.platform_id === platformId)
  }

  const isTokenExpired = (connection: PlatformConnection) => {
    if (!connection.token_expires_at) return false
    return new Date(connection.token_expires_at) < new Date()
  }

  if (error) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load connections</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">Social Media Accounts</CardTitle>
            <CardDescription className="text-muted-foreground">
              Connect your social media accounts to publish content directly from NeuClix.
              Your tokens are stored securely and used only for publishing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialPlatforms.map((platform) => {
                  const connection = getConnection(platform.id)
                  const isConnected = !!connection && connection.is_active
                  const expired = connection ? isTokenExpired(connection) : false
                  const IconComponent = ICON_MAP[platform.id] || ExternalLink

                  return (
                    <Card
                      key={platform.id}
                      className={`bg-secondary/50 border-border transition-all ${
                        isConnected ? "ring-1 ring-primary/30" : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: platform.brandColor + "20" }}
                            >
                              <IconComponent
                                className="w-5 h-5"
                                style={{ color: platform.brandColor }}
                              />
                            </div>
                            <div>
                              <h3 className="font-medium text-card-foreground">
                                {platform.name}
                              </h3>
                              {isConnected && connection && (
                                <p className="text-xs text-muted-foreground">
                                  {connection.account_username
                                    ? `@${connection.account_username}`
                                    : connection.account_name}
                                </p>
                              )}
                            </div>
                          </div>
                          {isConnected ? (
                            expired ? (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            ) : (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Connected
                              </Badge>
                            )
                          ) : (
                            <Badge variant="secondary" className="text-muted-foreground">
                              <XCircle className="w-3 h-3 mr-1" />
                              Not Connected
                            </Badge>
                          )}
                        </div>

                        {isConnected && connection && (
                          <div className="flex items-center gap-2 mb-3 p-2 bg-background/50 rounded-lg">
                            {connection.profile_image_url ? (
                              <Image
                                src={connection.profile_image_url || "/placeholder.svg"}
                                alt={connection.account_name}
                                width={24}
                                height={24}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                                <IconComponent className="w-3 h-3" />
                              </div>
                            )}
                            <span className="text-sm text-foreground truncate flex-1">
                              {connection.account_name}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {isConnected ? (
                            <>
                              {expired && (
                                <Button
                                  size="sm"
                                  onClick={() => handleConnect(platform.id)}
                                  disabled={connecting === platform.id}
                                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                                >
                                  {connecting === platform.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <RefreshCw className="w-4 h-4 mr-1" />
                                      Reconnect
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setConfirmDisconnect(connection)}
                                disabled={disconnecting === platform.id}
                                className="border-destructive/50 text-destructive hover:bg-destructive/10 bg-transparent"
                              >
                                {disconnecting === platform.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleConnect(platform.id)}
                              disabled={connecting === platform.id}
                              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                              {connecting === platform.id ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Connect
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        <p className="text-xs text-muted-foreground mt-3">
                          {platform.description}
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Connected Accounts Summary */}
        {connections.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">
                Connected Accounts ({connections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {connections.map((connection) => {
                  const platform = socialPlatforms.find((p) => p.id === connection.platform_id)
                  const IconComponent = ICON_MAP[connection.platform_id] || ExternalLink
                  const expired = isTokenExpired(connection)

                  return (
                    <div
                      key={connection.id}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: platform?.brandColor }}
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {connection.account_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {platform?.name} {expired && "- Token expired"}
                          </p>
                        </div>
                      </div>
                      {expired ? (
                        <Badge variant="destructive">Needs Reconnect</Badge>
                      ) : (
                        <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Disconnect Confirmation Dialog */}
      <AlertDialog open={!!confirmDisconnect} onOpenChange={() => setConfirmDisconnect(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-card-foreground">
              Disconnect {confirmDisconnect?.account_name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will remove access to this account. You can reconnect at any time.
              Scheduled posts for this platform will not be published.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-secondary text-foreground border-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDisconnect && handleDisconnect(confirmDisconnect)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
