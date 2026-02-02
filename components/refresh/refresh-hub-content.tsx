"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  RefreshCw,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Copy,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"

interface ContentAnalysis {
  readabilityScore: number
  seoScore: number
  engagementScore: number
  issues: { type: "warning" | "error"; message: string }[]
  suggestions: string[]
}

export function RefreshHubContent() {
  const [originalContent, setOriginalContent] = useState("")
  const [refreshedContent, setRefreshedContent] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null)
  const [contentUrl, setContentUrl] = useState("")

  const handleAnalyzeContent = async () => {
    if (!originalContent.trim()) {
      toast.error("Please enter content to analyze")
      return
    }

    setIsAnalyzing(true)
    try {
      // Simulated analysis
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockAnalysis: ContentAnalysis = {
        readabilityScore: 65,
        seoScore: 55,
        engagementScore: 70,
        issues: [
          { type: "warning", message: "Sentences are too long (avg 28 words)" },
          { type: "error", message: "Missing H2 headings" },
          { type: "warning", message: "Passive voice detected in 15% of sentences" },
          { type: "warning", message: "No internal links found" },
        ],
        suggestions: [
          "Add 2-3 relevant H2 subheadings",
          "Include a call-to-action in the conclusion",
          "Add statistics or data to support claims",
          "Shorten paragraphs to improve readability",
          "Include internal links to related content",
        ],
      }

      setAnalysis(mockAnalysis)
      toast.success("Content analyzed!")
    } catch {
      toast.error("Failed to analyze content")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRefreshContent = async () => {
    if (!originalContent.trim()) {
      toast.error("Please enter content to refresh")
      return
    }

    setIsRefreshing(true)
    try {
      const response = await fetch("/api/ai/refresh-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: originalContent }),
      })

      if (!response.ok) throw new Error("Failed to refresh")

      const data = await response.json()
      setRefreshedContent(data.refreshedContent)
      toast.success("Content refreshed!")
    } catch {
      // Demo refreshed content
      setRefreshedContent(
        `${originalContent}\n\n[AI ENHANCED VERSION]\n\nThis is where the AI-refreshed content would appear with:\n- Improved readability\n- Better SEO optimization\n- Enhanced engagement factors\n- Updated statistics and data\n- Added subheadings and structure`
      )
      toast.success("Content refreshed!")
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleCopyContent = () => {
    navigator.clipboard.writeText(refreshedContent)
    toast.success("Content copied to clipboard")
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Refresh Hub</h1>
        <p className="text-muted-foreground">
          Analyze and improve your existing content with AI
        </p>
      </div>

      <Tabs defaultValue="analyze" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="analyze" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-2" />
            Analyze Content
          </TabsTrigger>
          <TabsTrigger value="refresh" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Content
          </TabsTrigger>
          <TabsTrigger value="bulk" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="w-4 h-4 mr-2" />
            Bulk Refresh
          </TabsTrigger>
        </TabsList>

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Original Content</CardTitle>
                <CardDescription>
                  Paste your content or enter a URL to analyze
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Content URL (optional)</Label>
                  <Input
                    id="url"
                    placeholder="https://yoursite.com/blog/article"
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Or paste content directly</Label>
                  <Textarea
                    id="content"
                    placeholder="Paste your article, blog post, or marketing copy here..."
                    value={originalContent}
                    onChange={(e) => setOriginalContent(e.target.value)}
                    className="bg-input border-border min-h-[250px]"
                  />
                </div>
                <Button
                  onClick={handleAnalyzeContent}
                  disabled={isAnalyzing || !originalContent.trim()}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Analyze Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Analysis Results</CardTitle>
                <CardDescription>
                  Content quality scores and improvement suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysis ? (
                  <div className="space-y-6">
                    {/* Scores */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Readability</p>
                        <p className={`text-2xl font-bold ${getScoreColor(analysis.readabilityScore)}`}>
                          {analysis.readabilityScore}
                        </p>
                        <Progress value={analysis.readabilityScore} className="mt-2 h-2" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">SEO</p>
                        <p className={`text-2xl font-bold ${getScoreColor(analysis.seoScore)}`}>
                          {analysis.seoScore}
                        </p>
                        <Progress value={analysis.seoScore} className="mt-2 h-2" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-1">Engagement</p>
                        <p className={`text-2xl font-bold ${getScoreColor(analysis.engagementScore)}`}>
                          {analysis.engagementScore}
                        </p>
                        <Progress value={analysis.engagementScore} className="mt-2 h-2" />
                      </div>
                    </div>

                    {/* Issues */}
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-3">Issues Found</h4>
                      <div className="space-y-2">
                        {analysis.issues.map((issue, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-2 rounded-lg bg-muted/50"
                          >
                            {issue.type === "error" ? (
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                            )}
                            <span className="text-sm text-muted-foreground">{issue.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggestions */}
                    <div>
                      <h4 className="font-semibold text-card-foreground mb-3">Suggestions</h4>
                      <div className="space-y-2">
                        {analysis.suggestions.map((suggestion, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-2 rounded-lg bg-primary/10"
                          >
                            <CheckCircle className="w-4 h-4 text-primary mt-0.5" />
                            <span className="text-sm text-muted-foreground">{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Paste content and click Analyze to see results</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Refresh Tab */}
        <TabsContent value="refresh" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Original */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Original Content</CardTitle>
                <CardDescription>
                  Paste the content you want to refresh
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste your outdated or underperforming content here..."
                  value={originalContent}
                  onChange={(e) => setOriginalContent(e.target.value)}
                  className="bg-input border-border min-h-[300px]"
                />
                <Button
                  onClick={handleRefreshContent}
                  disabled={isRefreshing || !originalContent.trim()}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isRefreshing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Refresh with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Refreshed */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-card-foreground">Refreshed Content</CardTitle>
                    <CardDescription>
                      AI-enhanced version of your content
                    </CardDescription>
                  </div>
                  {refreshedContent && (
                    <Button variant="outline" size="sm" onClick={handleCopyContent}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {refreshedContent ? (
                  <div className="p-4 rounded-lg bg-muted/50 min-h-[300px] whitespace-pre-wrap text-sm text-card-foreground">
                    {refreshedContent}
                  </div>
                ) : (
                  <div className="min-h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ArrowRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Refreshed content will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Refresh Options */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Refresh Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Improve SEO", active: true },
                  { label: "Update Statistics", active: true },
                  { label: "Add Subheadings", active: true },
                  { label: "Shorten Sentences", active: false },
                  { label: "Add Call-to-Action", active: true },
                  { label: "Include Keywords", active: false },
                  { label: "Modernize Tone", active: false },
                  { label: "Add Examples", active: true },
                ].map((option) => (
                  <Badge
                    key={option.label}
                    variant={option.active ? "default" : "outline"}
                    className={`cursor-pointer ${
                      option.active ? "bg-primary text-primary-foreground" : ""
                    }`}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Tab */}
        <TabsContent value="bulk" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Bulk Content Refresh</CardTitle>
              <CardDescription>
                Queue multiple pieces of content for AI refresh
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "10 SEO Tips for 2024", status: "completed", improvement: "+15%" },
                  { title: "Marketing Automation Guide", status: "processing", improvement: null },
                  { title: "Lead Generation Strategies", status: "queued", improvement: null },
                  { title: "Content Marketing ROI", status: "queued", improvement: null },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground capitalize">{item.status}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.status === "completed" && (
                        <Badge variant="default" className="bg-green-600">
                          {item.improvement} SEO
                        </Badge>
                      )}
                      {item.status === "processing" && (
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      )}
                      {item.status === "queued" && (
                        <Badge variant="secondary">Queued</Badge>
                      )}
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  Add Content to Queue
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
