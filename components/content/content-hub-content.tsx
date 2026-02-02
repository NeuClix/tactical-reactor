"use client"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import {
  FileText,
  Sparkles,
  Save,
  Copy,
  Loader2,
  History,
  PenTool,
  ListChecks,
  Search,
  BookOpen,
  Brain,
} from "lucide-react"

interface BrandProfile {
  id: string
  profile_name: string
  core_keywords: string[] | null
  company_info: string | null
  brand_voice: string | null
  target_audience: string | null
  unique_value: string | null
  custom_instructions: string | null
}

interface Content {
  id: string
  title: string
  content_type: string
  content: string
  meta_title: string | null
  meta_description: string | null
  created_at: string
}

interface ContentHubContentProps {
  companyId: string
  brandProfile: BrandProfile | null
  recentContent: Content[]
}

const contentTypes = [
  { value: "blog-post", label: "Blog Post" },
  { value: "landing-page", label: "Landing Page" },
  { value: "product-description", label: "Product Description" },
  { value: "email", label: "Email Copy" },
  { value: "social-media", label: "Social Media Post" },
  { value: "meta-tags", label: "Meta Tags Only" },
]

export function ContentHubContent({
  companyId,
  brandProfile,
  recentContent: initialRecentContent,
}: ContentHubContentProps) {
  const [topic, setTopic] = useState("")
  const [keywords, setKeywords] = useState("")
  const [contentType, setContentType] = useState("blog-post")
  const [additionalInstructions, setAdditionalInstructions] = useState("")
  const [savedContent, setSavedContent] = useState<Content[]>(initialRecentContent)
  const [saving, setSaving] = useState(false)
  
  // Research state
  const [researchTopic, setResearchTopic] = useState("")
  const [researchDepth, setResearchDepth] = useState<"quick" | "standard" | "comprehensive">("standard")
  const [researchStyle, setResearchStyle] = useState<"wikipedia" | "blog" | "academic" | "news">("wikipedia")

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/content" }),
  })

  // Separate chat for research
  const { 
    messages: researchMessages, 
    sendMessage: sendResearchMessage, 
    status: researchStatus, 
    setMessages: setResearchMessages 
  } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai/storm-research" }),
  })

  const isLoading = status === "streaming" || status === "submitted"
  const isResearchLoading = researchStatus === "streaming" || researchStatus === "submitted"
  
  const lastAssistantMessage = messages.filter((m) => m.role === "assistant").pop()
  const lastResearchMessage = researchMessages.filter((m) => m.role === "assistant").pop()
  
  // Extract text from parts
  const generatedContent = lastAssistantMessage?.parts
    ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("") || ""

  const researchContent = lastResearchMessage?.parts
    ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("") || ""

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic")
      return
    }

    const prompt = `Create a ${contentTypes.find((t) => t.value === contentType)?.label || "blog post"} about: ${topic}

${keywords ? `Target Keywords: ${keywords}` : ""}
${additionalInstructions ? `Additional Instructions: ${additionalInstructions}` : ""}

Please include:
1. A compelling title
2. Meta title (under 60 characters)
3. Meta description (under 160 characters)
4. The full content with proper heading structure`

    const brandContext = brandProfile
      ? {
          companyInfo: brandProfile.company_info,
          brandVoice: brandProfile.brand_voice,
          targetAudience: brandProfile.target_audience,
          uniqueValue: brandProfile.unique_value,
          coreKeywords: brandProfile.core_keywords,
          customInstructions: brandProfile.custom_instructions,
        }
      : null

    setMessages([])
    await sendMessage(
      { text: prompt },
      { body: { brandContext, contentType } }
    )
  }

  const handleSave = async () => {
    if (!generatedContent) {
      toast.error("No content to save")
      return
    }

    setSaving(true)
    const supabase = createClient()

    // Extract title from content (first line starting with #)
    const titleMatch = generatedContent.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : topic

    // Try to extract meta title and description
    const metaTitleMatch = generatedContent.match(/Meta Title[:\s]+(.+?)(?:\n|$)/i)
    const metaDescMatch = generatedContent.match(/Meta Description[:\s]+(.+?)(?:\n|$)/i)

    const { data, error } = await supabase
      .from("content")
      .insert({
        company_id: companyId,
        title,
        content_type: contentType,
        content: generatedContent,
        meta_title: metaTitleMatch ? metaTitleMatch[1].trim() : null,
        meta_description: metaDescMatch ? metaDescMatch[1].trim() : null,
        keywords: keywords ? keywords.split(",").map((k) => k.trim()) : null,
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      toast.error("Failed to save content")
      return
    }

    setSavedContent((prev) => [data, ...prev])
    toast.success("Content saved successfully")
  }

  const handleCopy = (content: string) => {
    if (!content) return
    navigator.clipboard.writeText(content)
    toast.success("Content copied to clipboard")
  }

  const handleResearch = async () => {
    if (!researchTopic.trim()) {
      toast.error("Please enter a research topic")
      return
    }

    setResearchMessages([])
    await sendResearchMessage(
      { text: researchTopic },
      { 
        body: { 
          topic: researchTopic, 
          depth: researchDepth, 
          style: researchStyle,
          providerId: "openai",
          modelId: "gpt-4o",
        } 
      }
    )
  }

  const handleSaveResearch = async () => {
    if (!researchContent) {
      toast.error("No research content to save")
      return
    }

    setSaving(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("content")
      .insert({
        company_id: companyId,
        title: researchTopic,
        content_type: "research-article",
        content: researchContent,
      })
      .select()
      .single()

    setSaving(false)

    if (error) {
      toast.error("Failed to save research")
      return
    }

    setSavedContent((prev) => [data, ...prev])
    toast.success("Research saved successfully")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Content Hub
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate SEO-optimized content powered by AI
        </p>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="bg-secondary">
          <TabsTrigger value="create" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <PenTool className="w-4 h-4 mr-2" />
            Create Content
          </TabsTrigger>
          <TabsTrigger value="research" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <BookOpen className="w-4 h-4 mr-2" />
            Deep Research
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Panel */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-card-foreground">Content Settings</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure your content generation parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contentType" className="text-card-foreground">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {contentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value} className="text-popover-foreground">
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-card-foreground">Topic / Title</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., 10 Signs You Need a New Roof"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-card-foreground">Target Keywords</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="roof repair, roofing contractor, storm damage"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">Separate with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-card-foreground">Additional Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={additionalInstructions}
                    onChange={(e) => setAdditionalInstructions(e.target.value)}
                    placeholder="Any specific requirements or guidelines..."
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-[80px]"
                  />
                </div>

                {brandProfile && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-primary flex items-center gap-2">
                      <ListChecks className="w-4 h-4" />
                      Using brand profile: {brandProfile.profile_name}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !topic.trim()}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Content
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Output Panel */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg text-card-foreground">Generated Content</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Your AI-generated content will appear here
                    </CardDescription>
                  </div>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(generatedContent)}
                        className="border-border text-foreground hover:bg-secondary bg-transparent"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="min-h-[400px] max-h-[600px] overflow-y-auto p-4 rounded-lg bg-input border border-border">
                  {isLoading && !generatedContent ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-muted-foreground">Generating content...</p>
                      </div>
                    </div>
                  ) : generatedContent ? (
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">
                        {generatedContent}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <p>Your generated content will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Research Tab - STORM Methodology */}
        <TabsContent value="research" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                STORM Deep Research
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Generate comprehensive Wikipedia-style research articles using the Stanford STORM methodology.
                Multi-perspective research with citations and structured content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-2">
                  <Label htmlFor="researchTopic" className="text-card-foreground">Research Topic</Label>
                  <Input
                    id="researchTopic"
                    value={researchTopic}
                    onChange={(e) => setResearchTopic(e.target.value)}
                    placeholder="e.g., The impact of AI on modern marketing strategies"
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-card-foreground">Research Depth</Label>
                  <Select value={researchDepth} onValueChange={(v) => setResearchDepth(v as typeof researchDepth)}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="quick" className="text-popover-foreground">Quick (500-800 words)</SelectItem>
                      <SelectItem value="standard" className="text-popover-foreground">Standard (1500-2500 words)</SelectItem>
                      <SelectItem value="comprehensive" className="text-popover-foreground">Comprehensive (3000+ words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-card-foreground">Writing Style</Label>
                  <Select value={researchStyle} onValueChange={(v) => setResearchStyle(v as typeof researchStyle)}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="wikipedia" className="text-popover-foreground">Wikipedia (Encyclopedic)</SelectItem>
                      <SelectItem value="blog" className="text-popover-foreground">Blog (Conversational)</SelectItem>
                      <SelectItem value="academic" className="text-popover-foreground">Academic (Formal)</SelectItem>
                      <SelectItem value="news" className="text-popover-foreground">News (Journalistic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="lg:col-span-3 flex items-end">
                  <Button
                    onClick={handleResearch}
                    disabled={isResearchLoading || !researchTopic.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isResearchLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Start Research
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Research Output */}
              <div className="border-t border-border pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-card-foreground">Research Output</h3>
                  {researchContent && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(researchContent)}
                        className="border-border text-foreground hover:bg-secondary bg-transparent"
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveResearch}
                        disabled={saving}
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="min-h-[400px] max-h-[700px] overflow-y-auto p-4 rounded-lg bg-input border border-border">
                  {isResearchLoading && !researchContent ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-muted-foreground">Conducting multi-perspective research...</p>
                        <p className="text-sm text-muted-foreground mt-1">This may take a moment for comprehensive articles</p>
                      </div>
                    </div>
                  ) : researchContent ? (
                    <div className="prose prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">
                        {researchContent}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                      <BookOpen className="w-12 h-12 mb-3 opacity-50" />
                      <p>Enter a topic and start research</p>
                      <p className="text-sm mt-1">Using Stanford STORM methodology for comprehensive articles</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Content History</CardTitle>
              <CardDescription className="text-muted-foreground">
                Your previously generated and saved content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedContent.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No saved content yet</p>
                  <p className="text-sm">Generate and save content to see it here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedContent.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {contentTypes.find((t) => t.value === item.content_type)?.label || item.content_type}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {item.meta_description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {item.meta_description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
