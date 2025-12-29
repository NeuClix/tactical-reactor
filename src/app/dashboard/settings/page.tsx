'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface UserProfile {
  email: string
  name?: string
}

interface Subscription {
  id: string
  plan: string
  status: string
  current_period_end: string
}

export default function SettingsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  })

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      setProfile({
        email: user.email || '',
        name: user.user_metadata?.name || '',
      })

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

      if (subData) {
        setSubscription(subData)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    try {
      setSaving(true)
      setMessage(null)

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

      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      await loadUserData()
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      })

      if (error) throw error

      setMessage({ type: 'success', text: 'Password updated successfully!' })
      setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (error) {
      console.error('Error updating password:', error)
      setMessage({ type: 'error', text: 'Failed to update password' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
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

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
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
      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">
                  Plan: {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </p>
                <div className="text-sm text-slate-600 flex items-center gap-2">
                  <span>Status:</span>
                  <Badge
                    variant={
                      subscription.status === 'active' ? 'default' : 'secondary'
                    }
                  >
                    {subscription.status}
                  </Badge>
                </div>
                {subscription.current_period_end && (
                  <p className="text-sm text-slate-600 mt-2">
                    Renews:{' '}
                    {new Date(subscription.current_period_end).toLocaleDateString()}
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
