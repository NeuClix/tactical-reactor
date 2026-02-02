"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ImageIcon,
  Wand2,
  Download,
  Copy,
  Trash2,
  Loader2,
  Sparkles,
  Grid,
  List,
  Search,
  Filter,
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

interface GeneratedImage {
  id: string
  prompt: string
  imageUrl: string
  createdAt: Date
}

export function MediaHubContent() {
  const [prompt, setPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first")
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch("/api/ai/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) throw new Error("Failed to enhance prompt")

      const data = await response.json()
      setEnhancedPrompt(data.enhancedPrompt)
      toast.success("Prompt enhanced!")
    } catch {
      toast.error("Failed to enhance prompt")
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleGenerateImage = async () => {
    const finalPrompt = enhancedPrompt || prompt
    if (!finalPrompt.trim()) {
      toast.error("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      })

      if (!response.ok) throw new Error("Failed to generate image")

      const data = await response.json()
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt: finalPrompt,
        imageUrl: data.imageUrl,
        createdAt: new Date(),
      }

      setGeneratedImages([newImage, ...generatedImages])
      toast.success("Image generated!")
      setPrompt("")
      setEnhancedPrompt("")
    } catch {
      toast.error("Failed to generate image. Make sure Fal AI is connected.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Prompt copied to clipboard")
  }

  const handleDeleteImage = (id: string) => {
    setGeneratedImages(generatedImages.filter((img) => img.id !== id))
    toast.success("Image deleted")
  }

  const filteredImages = generatedImages.filter((img) =>
    img.prompt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Media Hub</h1>
        <p className="text-muted-foreground">
          AI-powered image generation studio for your marketing assets
        </p>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="generate" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Wand2 className="w-4 h-4 mr-2" />
            Generate
          </TabsTrigger>
          <TabsTrigger value="library" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <ImageIcon className="w-4 h-4 mr-2" />
            Library
          </TabsTrigger>
        </TabsList>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Prompt Input */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Image Prompt
                </CardTitle>
                <CardDescription>
                  Describe the image you want to generate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Your Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A professional marketing image showing..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="bg-input border-border min-h-[100px]"
                  />
                </div>

                <Button
                  variant="outline"
                  onClick={handleEnhancePrompt}
                  disabled={isEnhancing || !prompt.trim()}
                  className="w-full bg-transparent"
                >
                  {isEnhancing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enhancing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Enhance with AI
                    </>
                  )}
                </Button>

                {enhancedPrompt && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Enhanced Prompt</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyPrompt(enhancedPrompt)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                      {enhancedPrompt}
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleGenerateImage}
                  disabled={isGenerating || (!prompt.trim() && !enhancedPrompt)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Preview</CardTitle>
                <CardDescription>
                  Your generated image will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImages.length > 0 ? (
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={generatedImages[0].imageUrl || "/placeholder.svg"}
                      alt={generatedImages[0].prompt}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <p className="text-white text-sm line-clamp-2">
                        {generatedImages[0].prompt}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No image generated yet</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Prompt Templates */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Quick Templates</CardTitle>
              <CardDescription>
                Click to use these pre-made prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "Professional headshot with studio lighting",
                  "Modern office workspace with plants",
                  "Abstract tech background with geometric shapes",
                  "Product showcase on clean white background",
                  "Social media banner with gradient colors",
                  "Hero image for SaaS landing page",
                ].map((template) => (
                  <Badge
                    key={template}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => setPrompt(template)}
                  >
                    {template}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-1 border border-border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Images Grid/List */}
          {filteredImages.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                  : "space-y-4"
              }
            >
              {filteredImages.map((image) => (
                <Card
                  key={image.id}
                  className={`bg-card border-border overflow-hidden ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                >
                  <div
                    className={`relative ${
                      viewMode === "grid" ? "aspect-square" : "w-40 h-40 flex-shrink-0"
                    }`}
                  >
                    <Image
                      src={image.imageUrl || "/placeholder.svg"}
                      alt={image.prompt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className={viewMode === "list" ? "flex-1 p-4" : "p-4"}>
                    <p className="text-sm text-card-foreground line-clamp-2 mb-2">
                      {image.prompt}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      {image.createdAt.toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPrompt(image.prompt)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={image.imageUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="w-3 h-3" />
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteImage(image.id)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No images match your search"
                    : "No images in your library yet. Generate some!"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
