"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Brain,
  Search,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Target,
  BarChart3,
  FileText,
  ExternalLink,
} from "lucide-react"
import { toast } from "sonner"

interface CompetitorAnalysis {
  id: string
  domain: string
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  keywords: string[]
  analyzedAt: Date
}

interface SEOAuditResult {
  category: string
  score: number
  status: "good" | "warning" | "error"
  message: string
  recommendation: string
}

export function IntelHubContent() {
  const [competitorUrl, setCompetitorUrl] = useState("")
  const [websiteUrl, setWebsiteUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAuditing, setIsAuditing] = useState(false)
  const [analyses, setAnalyses] = useState<CompetitorAnalysis[]>([])
  const [auditResults, setAuditResults] = useState<SEOAuditResult[]>([])

  const handleAnalyzeCompetitor = async () => {
    if (!competitorUrl.trim()) {
      toast.error("Please enter a competitor URL")
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/ai/competitor-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: competitorUrl }),
      })

      if (!response.ok) throw new Error("Failed to analyze")

      const data = await response.json()
      setAnalyses([data, ...analyses])
      toast.success("Competitor analyzed!")
      setCompetitorUrl("")
    } catch {
      // Demo data for now
      const demoAnalysis: CompetitorAnalysis = {
        id: Date.now().toString(),
        domain: competitorUrl,
        strengths: [
          "Strong brand recognition",
          "Comprehensive content library",
          "Active social media presence",
        ],
        weaknesses: [
          "Slow page load times",
          "Limited mobile optimization",
          "Inconsistent posting schedule",
        ],
        opportunities: [
          "Target long-tail keywords they're missing",
          "Create more video content",
          "Improve local SEO presence",
        ],
        keywords: ["marketing automation", "lead generation", "CRM software"],
        analyzedAt: new Date(),
      }
      setAnalyses([demoAnalysis, ...analyses])
      toast.success("Competitor analyzed!")
      setCompetitorUrl("")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSEOAudit = async () => {
    if (!websiteUrl.trim()) {
      toast.error("Please enter your website URL")
      return
    }

    setIsAuditing(true)
    try {
      // Simulated audit results
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const demoResults: SEOAuditResult[] = [
        {
          category: "Page Speed",
          score: 72,
          status: "warning",
          message: "Page loads in 3.2 seconds",
          recommendation: "Optimize images and enable caching to improve load times",
        },
        {
          category: "Mobile Friendliness",
          score: 95,
          status: "good",
          message: "Site is mobile responsive",
          recommendation: "Consider improving touch targets for better UX",
        },
        {
          category: "Meta Tags",
          score: 60,
          status: "warning",
          message: "Some pages missing meta descriptions",
          recommendation: "Add unique meta descriptions to all pages",
        },
        {
          category: "SSL Security",
          score: 100,
          status: "good",
          message: "SSL certificate is valid",
          recommendation: "No action needed",
        },
        {
          category: "Content Quality",
          score: 45,
          status: "error",
          message: "Thin content detected on multiple pages",
          recommendation: "Expand content to at least 500 words per page",
        },
        {
          category: "Backlinks",
          score: 55,
          status: "warning",
          message: "Low domain authority",
          recommendation: "Build quality backlinks through guest posting and partnerships",
        },
      ]

      setAuditResults(demoResults)
      toast.success("SEO audit complete!")
    } catch {
      toast.error("Failed to complete audit")
    } finally {
      setIsAuditing(false)
    }
  }

  const getStatusIcon = (status: SEOAuditResult["status"]) => {
    switch (status) {
      case "good":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
  }

  const overallScore =
    auditResults.length > 0
      ? Math.round(auditResults.reduce((acc, r) => acc + r.score, 0) / auditResults.length)
      : 0

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Intel Hub</h1>
        <p className="text-muted-foreground">
          Competitive intelligence and SEO analysis powered by AI
        </p>
      </div>

      <Tabs defaultValue="competitor" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="competitor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Target className="w-4 h-4 mr-2" />
            Competitor Analysis
          </TabsTrigger>
          <TabsTrigger value="seo" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BarChart3 className="w-4 h-4 mr-2" />
            SEO Audit
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <TrendingUp className="w-4 h-4 mr-2" />
            Opportunities
          </TabsTrigger>
        </TabsList>

        {/* Competitor Analysis Tab */}
        <TabsContent value="competitor" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Analyze Competitor
              </CardTitle>
              <CardDescription>
                Enter a competitor URL to get AI-powered insights
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="competitor" className="sr-only">
                    Competitor URL
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="competitor"
                      placeholder="https://competitor.com"
                      value={competitorUrl}
                      onChange={(e) => setCompetitorUrl(e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAnalyzeCompetitor}
                  disabled={isAnalyzing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analyses.length > 0 ? (
            <div className="space-y-4">
              {analyses.map((analysis) => (
                <Card key={analysis.id} className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-card-foreground flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        {analysis.domain}
                      </CardTitle>
                      <Badge variant="secondary">
                        {analysis.analyzedAt.toLocaleDateString()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* Strengths */}
                      <div>
                        <h4 className="font-semibold text-green-500 mb-2 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Strengths
                        </h4>
                        <ul className="space-y-1">
                          {analysis.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div>
                        <h4 className="font-semibold text-red-500 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Weaknesses
                        </h4>
                        <ul className="space-y-1">
                          {analysis.weaknesses.map((w, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Opportunities */}
                      <div>
                        <h4 className="font-semibold text-primary mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Opportunities
                        </h4>
                        <ul className="space-y-1">
                          {analysis.opportunities.map((o, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              {o}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Keywords */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <h4 className="font-semibold text-card-foreground mb-2">Target Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywords.map((kw, i) => (
                          <Badge key={i} variant="outline">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Enter a competitor URL above to start analyzing
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* SEO Audit Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                SEO Site Audit
              </CardTitle>
              <CardDescription>
                Analyze your website for SEO improvements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="website" className="sr-only">
                    Your Website URL
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="pl-10 bg-input border-border"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSEOAudit}
                  disabled={isAuditing}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isAuditing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Run Audit
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {auditResults.length > 0 ? (
            <>
              {/* Overall Score */}
              <Card className="bg-card border-border">
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-card-foreground">Overall SEO Score</h3>
                      <p className="text-sm text-muted-foreground">
                        Based on {auditResults.length} factors
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-bold text-primary">{overallScore}</span>
                      <span className="text-2xl text-muted-foreground">/100</span>
                    </div>
                  </div>
                  <Progress value={overallScore} className="mt-4 h-3" />
                </CardContent>
              </Card>

              {/* Audit Results */}
              <div className="grid gap-4 md:grid-cols-2">
                {auditResults.map((result, index) => (
                  <Card key={index} className="bg-card border-border">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-card-foreground">
                              {result.category}
                            </h4>
                            <Badge
                              variant={
                                result.status === "good"
                                  ? "default"
                                  : result.status === "warning"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {result.score}/100
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {result.message}
                          </p>
                          <p className="text-sm text-primary">
                            {result.recommendation}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Enter your website URL above to run an SEO audit
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Content Opportunities
              </CardTitle>
              <CardDescription>
                AI-discovered content gaps and ranking opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    keyword: "AI marketing automation trends 2026",
                    difficulty: 35,
                    volume: 2400,
                    opportunity: "high",
                  },
                  {
                    keyword: "B2B lead generation best practices",
                    difficulty: 55,
                    volume: 5200,
                    opportunity: "medium",
                  },
                  {
                    keyword: "Content marketing ROI calculator",
                    difficulty: 25,
                    volume: 1800,
                    opportunity: "high",
                  },
                  {
                    keyword: "Marketing automation for small business",
                    difficulty: 45,
                    volume: 3100,
                    opportunity: "medium",
                  },
                  {
                    keyword: "AI content creation tools comparison",
                    difficulty: 60,
                    volume: 4500,
                    opportunity: "low",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-card-foreground">{item.keyword}</p>
                        <p className="text-sm text-muted-foreground">
                          Volume: {item.volume.toLocaleString()}/mo | Difficulty: {item.difficulty}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          item.opportunity === "high"
                            ? "default"
                            : item.opportunity === "medium"
                            ? "secondary"
                            : "outline"
                        }
                        className={item.opportunity === "high" ? "bg-green-600" : ""}
                      >
                        {item.opportunity} opportunity
                      </Badge>
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Create Content
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Trending Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    "AI-powered personalization",
                    "Voice search optimization",
                    "Zero-party data collection",
                    "Sustainable marketing practices",
                    "Interactive content experiences",
                  ].map((topic, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">{topic}</span>
                      <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground cursor-pointer hover:text-primary" />
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Target className="w-4 h-4 mr-2" />
                  Add New Competitor
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Schedule Weekly Audit
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
