'use client'

import { useState, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageLoading } from '@/components/ui/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { validatePassword } from '@/lib/validation'
import { useAsyncData, useNotification, getAlertVariant } from '@/hooks'
import { ThemeSettings } from '@/components/theme-settings'
import { TagManagement } from '@/components/tag-management'
import { User, Palette, Tags, CreditCard } from 'lucide-react'

interface UserProfile {
  email: string
  name: string
}

interface Subscription {
  id: string
  plan: string
  status: string
  current_period_end: string
}

interface UserData {
  profile: UserProfile
  subscription: Subscription | null
}

function SettingsContent() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab') || 'profile'

  const [saving, setSaving] = useState(false)
  const { notification, showSuccess, showError } = useNotification()

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  })

  const handleTabChange = (value: string) => {
    router.push(`/dashboard/settings?tab=${value}`, { scroll: false })
  }

  const {
    data: userData,
    isLoading,
    refetch,
  } = useAsyncData<UserData | null>({
    fetchFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return null

      const profile: UserProfile = {
        email: user.email || '',
        name: user.user_metadata?.name || '',
      }

      // Initialize form data
      setFormData({
        email: user.email || '',
        name: user.user_metadata?.name || '',
        password: '',
        confirmPassword: '',
      })

      // Load subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      return {
        profile,
        subscription: subData || null,
      }
    },
  })

  const handleUpdateProfile = useCallback(async () => {
    try {
      setSaving(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
        },
      })

      if (error) throw error

      showSuccess('Profile updated successfully!')
      await refetch()
    } catch (error) {
      console.error('Error updating profile:', error)
      showError('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }, [supabase, formData.name, showSuccess, showError, refetch])

  const handleUpdatePassword = useCallback(async () => {
    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match')
      return
    }

    // Validate password strength
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.valid) {
      showError(passwordValidation.error || 'Invalid password')
      return
    }

    try {
      setSaving(true)

      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) throw error

      showSuccess('Password updated successfully!')
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (error) {
      console.error('Error updating password:', error)
      showError('Failed to update password')
    } finally {
      setSaving(false)
    }
  }, [supabase, formData.password, formData.confirmPassword, showSuccess, showError])

  if (isLoading) {
    return <PageLoading message="Loading settings..." />
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-dark-50">
          Settings
        </h1>
        <p className="mt-2 text-gray-600 dark:text-dark-300">
          Manage your account settings and preferences
        </p>
      </div>

      {notification && (
        <Alert variant={getAlertVariant(notification.type)}>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="gap-2">
            <Tags className="h-4 w-4" />
            <span className="hidden sm:inline">Tags</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-900 dark:text-dark-50">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100 dark:bg-dark-800 text-gray-500 dark:text-dark-300"
                />
                <p className="text-xs text-gray-500 dark:text-dark-400">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="full-name" className="text-sm font-medium text-gray-900 dark:text-dark-50">
                  Full Name
                </label>
                <Input
                  id="full-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your full name"
                />
              </div>

              <Button onClick={handleUpdateProfile} disabled={saving}>
                {saving ? 'Updating...' : 'Update Profile'}
              </Button>
            </CardContent>
          </Card>

          {/* Password Card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium text-gray-900 dark:text-dark-50">
                  New Password
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter new password"
                  autoComplete="new-password"
                />
                <div className="text-xs text-gray-500 dark:text-dark-400 mt-2 space-y-1">
                  <p>Password must be at least 12 characters and contain:</p>
                  <ul className="list-disc list-inside">
                    <li>Uppercase and lowercase letters</li>
                    <li>At least one number</li>
                    <li>At least one special character (!@#$%^&amp;*)</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium text-gray-900 dark:text-dark-50">
                  Confirm Password
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                />
              </div>

              <Button
                onClick={handleUpdatePassword}
                disabled={saving || !formData.password}
              >
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-500/30 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
              <CardDescription className="text-red-600/70 dark:text-red-300/70">
                Irreversible actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <ThemeSettings />
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags">
          <TagManagement
            onSuccess={showSuccess}
            onError={showError}
          />
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing">
          {userData?.subscription ? (
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>Manage your subscription plan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-dark-50">
                      Plan: {userData.subscription.plan.charAt(0).toUpperCase() + userData.subscription.plan.slice(1)}
                    </p>
                    <div className="text-sm text-gray-600 dark:text-dark-300 flex items-center gap-2">
                      <span>Status:</span>
                      <Badge
                        variant={
                          userData.subscription.status === 'active' ? 'default' : 'secondary'
                        }
                      >
                        {userData.subscription.status}
                      </Badge>
                    </div>
                    {userData.subscription.current_period_end && (
                      <p className="text-sm text-gray-600 dark:text-dark-300 mt-2">
                        Renews:{' '}
                        {new Date(userData.subscription.current_period_end).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline">
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Active Subscription</CardTitle>
                <CardDescription>You don&apos;t have an active subscription</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-dark-300 mb-4">
                  Upgrade to a paid plan to unlock premium features.
                </p>
                <Button>
                  View Plans
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading settings..." />}>
      <SettingsContent />
    </Suspense>
  )
}
