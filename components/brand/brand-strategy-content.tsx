"use client"

import React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Download, Upload, Plus, Trash2, Save, Lock, Loader2 } from "lucide-react"
import Link from "next/link"

interface BrandProfile {
  id: string
  company_id: string
  profile_name: string
  gtm_id: string | null
  core_keywords: string[] | null
  company_info: string | null
  brand_voice: string | null
  target_audience: string | null
  unique_value: string | null
  content_pillars: string[] | null
  competitors: string[] | null
  custom_instructions: string | null
  created_at: string
  updated_at: string
}

interface BrandStrategyContentProps {
  companyId: string
  profiles: BrandProfile[]
  isPremium: boolean
}

export function BrandStrategyContent({
  companyId,
  profiles: initialProfiles,
  isPremium,
}: BrandStrategyContentProps) {
  const [profiles, setProfiles] = useState<BrandProfile[]>(initialProfiles)
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    initialProfiles[0]?.id || ""
  )
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Form state
  const [profileName, setProfileName] = useState("")
  const [gtmId, setGtmId] = useState("")
  const [coreKeywords, setCoreKeywords] = useState("")
  const [companyInfo, setCompanyInfo] = useState("")
  const [brandVoice, setBrandVoice] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [uniqueValue, setUniqueValue] = useState("")
  const [contentPillars, setContentPillars] = useState("")
  const [competitors, setCompetitors] = useState("")
  const [customInstructions, setCustomInstructions] = useState("")

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId)

  // Load profile data when selection changes
  useEffect(() => {
    if (selectedProfile) {
      setProfileName(selectedProfile.profile_name || "")
      setGtmId(selectedProfile.gtm_id || "")
      setCoreKeywords(selectedProfile.core_keywords?.join(", ") || "")
      setCompanyInfo(selectedProfile.company_info || "")
      setBrandVoice(selectedProfile.brand_voice || "")
      setTargetAudience(selectedProfile.target_audience || "")
      setUniqueValue(selectedProfile.unique_value || "")
      setContentPillars(selectedProfile.content_pillars?.join(", ") || "")
      setCompetitors(selectedProfile.competitors?.join(", ") || "")
      setCustomInstructions(selectedProfile.custom_instructions || "")
    }
  }, [selectedProfile])

  const handleSave = async () => {
    if (!selectedProfileId) return
    setSaving(true)

    const supabase = createClient()
    const { error } = await supabase
      .from("brand_profiles")
      .update({
        profile_name: profileName,
        gtm_id: gtmId || null,
        core_keywords: coreKeywords ? coreKeywords.split(",").map((k) => k.trim()) : null,
        company_info: companyInfo || null,
        brand_voice: brandVoice || null,
        target_audience: targetAudience || null,
        unique_value: uniqueValue || null,
        content_pillars: contentPillars ? contentPillars.split(",").map((p) => p.trim()) : null,
        competitors: competitors ? competitors.split(",").map((c) => c.trim()) : null,
        custom_instructions: customInstructions || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedProfileId)

    setSaving(false)

    if (error) {
      toast.error("Failed to save profile")
      return
    }

    // Update local state
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === selectedProfileId
          ? {
              ...p,
              profile_name: profileName,
              gtm_id: gtmId || null,
              core_keywords: coreKeywords ? coreKeywords.split(",").map((k) => k.trim()) : null,
              company_info: companyInfo || null,
              brand_voice: brandVoice || null,
              target_audience: targetAudience || null,
              unique_value: uniqueValue || null,
              content_pillars: contentPillars ? contentPillars.split(",").map((p) => p.trim()) : null,
              competitors: competitors ? competitors.split(",").map((c) => c.trim()) : null,
              custom_instructions: customInstructions || null,
            }
          : p
      )
    )

    toast.success("Profile saved successfully")
  }

  const handleCreateProfile = async () => {
    if (!isPremium && profiles.length >= 1) {
      toast.error("Upgrade to create multiple profiles")
      return
    }

    setCreating(true)
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from("brand_profiles")
      .insert({
        company_id: companyId,
        profile_name: `New Profile ${profiles.length + 1}`,
      })
      .select()
      .single()

    setCreating(false)

    if (error) {
      toast.error("Failed to create profile")
      return
    }

    setProfiles((prev) => [...prev, data])
    setSelectedProfileId(data.id)
    toast.success("Profile created")
  }

  const handleDeleteProfile = async () => {
    if (profiles.length <= 1) {
      toast.error("You must have at least one profile")
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from("brand_profiles")
      .delete()
      .eq("id", selectedProfileId)

    if (error) {
      toast.error("Failed to delete profile")
      return
    }

    const newProfiles = profiles.filter((p) => p.id !== selectedProfileId)
    setProfiles(newProfiles)
    setSelectedProfileId(newProfiles[0]?.id || "")
    toast.success("Profile deleted")
  }

  const handleExportData = () => {
    const dataToExport = {
      profiles,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `neuclix-brand-data-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast.success("Data exported successfully")
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string)
        // For now, just show a success message - full import would need more logic
        toast.success("Import functionality coming soon")
      } catch {
        toast.error("Invalid file format")
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Brand Strategy</h1>
        <p className="text-muted-foreground mt-1">
          Define your brand and content strategy to guide the AI. All your data is saved securely.
        </p>
      </div>

      {/* Data Management */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg text-card-foreground">Data Management</CardTitle>
          <CardDescription className="text-muted-foreground">
            Save a backup of all your data (profiles, connections, history, etc.) to a file, or
            import a backup to restore your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleExportData}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          <label>
            <Button
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>
        </CardContent>
      </Card>

      {/* Profile Management */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-card-foreground">Profile Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                {"Switch between different brand personas, or create new ones to tailor the AI's strategy."}
              </CardDescription>
            </div>
            {!isPremium && (
              <Link href="/dashboard/user?tab=billing">
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10 bg-transparent">
                  <Lock className="w-3 h-3 mr-1" />
                  Premium Feature
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
              <SelectTrigger className="flex-1 bg-input border-border text-foreground">
                <SelectValue placeholder="Select a profile" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id} className="text-popover-foreground">
                    {profile.profile_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="secondary"
              onClick={handleCreateProfile}
              disabled={creating || (!isPremium && profiles.length >= 1)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-1" />}
              New Profile
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteProfile}
              disabled={profiles.length <= 1}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      {selectedProfile && (
        <Card className="bg-card border-border">
          <CardContent className="pt-6 space-y-6">
            {/* Profile Name */}
            <div className="space-y-2">
              <Label htmlFor="profileName" className="text-card-foreground">Profile Name</Label>
              <p className="text-sm text-muted-foreground">
                The name of this brand profile (e.g., Roof Rescue, Commercial Division).
              </p>
              <Input
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Default Profile"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* GTM ID */}
            <div className="space-y-2">
              <Label htmlFor="gtmId" className="text-card-foreground">Google Tag Manager ID</Label>
              <p className="text-sm text-muted-foreground">
                Enter your GTM ID (e.g., GTM-XXXXXXX) for this specific brand profile.
              </p>
              <Input
                id="gtmId"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
                placeholder="GTM-XXXXXXX"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Once your GTM ID is added, you can easily deploy other tracking scripts like Facebook
                Pixel, Google Analytics 4, or Hotjar directly from your Google Tag Manager dashboard.
              </p>
            </div>

            {/* Core Keywords */}
            <div className="space-y-2">
              <Label htmlFor="coreKeywords" className="text-card-foreground">Core Keywords</Label>
              <p className="text-sm text-muted-foreground">
                List the most important keywords for this brand, separated by commas. The AI will
                prioritize these in its analysis and content generation.
              </p>
              <Textarea
                id="coreKeywords"
                value={coreKeywords}
                onChange={(e) => setCoreKeywords(e.target.value)}
                placeholder="roofing, roof repair, commercial roofing, residential roofing"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
              />
            </div>

            {/* Company Core Information */}
            <div className="space-y-2">
              <Label htmlFor="companyInfo" className="text-card-foreground">Company Core Information</Label>
              <p className="text-sm text-muted-foreground">
                Provide key details about your company that the AI should always consider.
              </p>
              <Textarea
                id="companyInfo"
                value={companyInfo}
                onChange={(e) => setCompanyInfo(e.target.value)}
                placeholder="Describe your company, its history, mission, and what makes it unique..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[120px]"
              />
            </div>

            {/* Brand Voice */}
            <div className="space-y-2">
              <Label htmlFor="brandVoice" className="text-card-foreground">Brand Voice & Tone</Label>
              <p className="text-sm text-muted-foreground">
                Describe how your brand communicates. Is it professional, friendly, technical, casual?
              </p>
              <Textarea
                id="brandVoice"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                placeholder="Professional yet approachable, uses industry terminology but explains complex concepts..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-2">
              <Label htmlFor="targetAudience" className="text-card-foreground">Target Audience</Label>
              <p className="text-sm text-muted-foreground">
                Who are your ideal customers? Describe their demographics, needs, and pain points.
              </p>
              <Textarea
                id="targetAudience"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Homeowners aged 35-65, property managers, commercial building owners..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
              />
            </div>

            {/* Unique Value Proposition */}
            <div className="space-y-2">
              <Label htmlFor="uniqueValue" className="text-card-foreground">Unique Value Proposition</Label>
              <p className="text-sm text-muted-foreground">
                What makes your company different from competitors?
              </p>
              <Textarea
                id="uniqueValue"
                value={uniqueValue}
                onChange={(e) => setUniqueValue(e.target.value)}
                placeholder="24/7 emergency service, lifetime warranty, locally owned for 25+ years..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[100px]"
              />
            </div>

            {/* Content Pillars */}
            <div className="space-y-2">
              <Label htmlFor="contentPillars" className="text-card-foreground">Content Pillars</Label>
              <p className="text-sm text-muted-foreground">
                Main topics/themes for your content strategy, separated by commas.
              </p>
              <Textarea
                id="contentPillars"
                value={contentPillars}
                onChange={(e) => setContentPillars(e.target.value)}
                placeholder="Roof maintenance tips, storm damage guides, material comparisons, industry news"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
              />
            </div>

            {/* Competitors */}
            <div className="space-y-2">
              <Label htmlFor="competitors" className="text-card-foreground">Key Competitors</Label>
              <p className="text-sm text-muted-foreground">
                List your main competitors, separated by commas. The AI will use this for analysis.
              </p>
              <Textarea
                id="competitors"
                value={competitors}
                onChange={(e) => setCompetitors(e.target.value)}
                placeholder="ABC Roofing, XYZ Contractors, Local Roof Pros"
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
              />
            </div>

            {/* Custom Instructions */}
            <div className="space-y-2">
              <Label htmlFor="customInstructions" className="text-card-foreground">Custom AI Instructions</Label>
              <p className="text-sm text-muted-foreground">
                Any additional instructions or guidelines for the AI to follow.
              </p>
              <Textarea
                id="customInstructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Always mention our BBB A+ rating, avoid technical jargon, focus on customer benefits..."
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[120px]"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
