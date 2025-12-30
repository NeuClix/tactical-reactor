'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PageLoading } from '@/components/ui/loading-spinner'
import { validatePassword } from '@/lib/validation'
import { useAsyncData, useNotification, getAlertVariant } from '@/hooks'

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

export default function SettingsPage() {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const { notification, showSuccess, showError } = useNotification()

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  })

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
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Account Settings
        </h1>
        <p className="mt-2 text-slate-600">
          Manage your profile, subscription, and preferences
        </p>
      </div>

      {notification && (
        <Alert variant={getAlertVariant(notification.type)}>
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              disabled
              className="bg-slate-100"
            />
            <p className="text-xs text-slate-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Full Name
            </label>
            <Input
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
            <label className="text-sm font-medium text-slate-900">
              New Password
            </label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter new password"
            />
            <div className="text-xs text-slate-500 mt-2 space-y-1">
              <p>Password must be at least 12 characters and contain:</p>
              <ul className="list-disc list-inside">
                <li>Uppercase and lowercase letters</li>
                <li>At least one number</li>
                <li>At least one special character (!@#$%^&amp;*)</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Confirm Password
            </label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              placeholder="Confirm new password"
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

      {/* Subscription Card */}
      {userData?.subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  Plan: {userData.subscription.plan.charAt(0).toUpperCase() + userData.subscription.plan.slice(1)}
                </p>
                <div className="text-sm text-slate-600 flex items-center gap-2">
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
                  <p className="text-sm text-slate-600 mt-2">
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
      )}

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Danger Zone</CardTitle>
          <CardDescription className="text-red-800">
            Irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
