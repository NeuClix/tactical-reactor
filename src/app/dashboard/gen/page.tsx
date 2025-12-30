'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Copy, Check } from 'lucide-react'

type GenerationType = 'blog' | 'social' | 'email' | 'ideas'

interface GenerationResult {
  response: string
  tokensUsed: number
  usageCount: number
  limit: number
}

export default function GenHubPage() {
  const [type, setType] = useState<GenerationType>('blog')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const generationTypes: { value: GenerationType; label: string; description: string }[] = [
    { value: 'blog', label: 'Blog Post', description: 'Generate engaging blog articles' },
    { value: 'social', label: 'Social Media', description: 'Create social posts' },
    { value: 'email', label: 'Email', description: 'Write marketing emails' },
    { value: 'ideas', label: 'Ideas', description: 'Brainstorm creative ideas' },
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate content')
        return
      }

      setResult(data)
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (result?.response) {
      navigator.clipboard.writeText(result.response)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-dark-50">
          Gen Hub
        </h1>
        <p className="mt-2 text-dark-300">
          Generate content using AI powered by Anthropic Claude
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Content Generator</CardTitle>
          <CardDescription>
            Choose a generation type and provide your prompt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Generation Type Selector */}
          <div className="space-y-3" role="radiogroup" aria-labelledby="generation-type-label">
            <label id="generation-type-label" className="text-sm font-medium text-dark-50">
              Generation Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {generationTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-colors ${
                    type === t.value
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-700 hover:border-dark-600'
                  }`}
                >
                  <div className="font-medium text-sm text-dark-100">{t.label}</div>
                  <div className="text-xs text-dark-400 mt-1">
                    {t.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label htmlFor="prompt-input" className="text-sm font-medium text-dark-50">
              Your Prompt
            </label>
            <textarea
              id="prompt-input"
              placeholder="Describe what you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-dark-600 rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 bg-dark-800 text-dark-100 placeholder:text-dark-400"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Content'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription className="mt-2">
                Tokens used: {result.tokensUsed} | Usage: {result.usageCount}{' '}
                /{result.limit}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-dark-800 p-4 rounded-lg whitespace-pre-wrap text-sm text-dark-200">
              {result.response}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
