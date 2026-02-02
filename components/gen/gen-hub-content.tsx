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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Users,
  Search,
  Building2,
  Mail,
  Phone,
  Globe,
  Linkedin,
  Loader2,
  UserPlus,
  Download,
  Filter,
  Sparkles,
  Target,
  MessageSquare,
} from "lucide-react"
import { toast } from "sonner"

interface Lead {
  id: string
  name: string
  company: string
  title: string
  email: string
  phone?: string
  website?: string
  linkedin?: string
  industry: string
  score: number
}

export function GenHubContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [industry, setIndustry] = useState("")
  const [companySize, setCompanySize] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])
  const [outreachMessage, setOutreachMessage] = useState("")
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false)

  const handleSearchLeads = async () => {
    if (!searchQuery.trim() && !industry) {
      toast.error("Please enter search criteria")
      return
    }

    setIsSearching(true)
    try {
      // Simulated lead search
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockLeads: Lead[] = [
        {
          id: "1",
          name: "Sarah Johnson",
          company: "TechCorp Solutions",
          title: "VP of Marketing",
          email: "sarah.j@techcorp.com",
          phone: "+1 (555) 123-4567",
          website: "techcorp.com",
          linkedin: "linkedin.com/in/sarahjohnson",
          industry: "Technology",
          score: 92,
        },
        {
          id: "2",
          name: "Michael Chen",
          company: "Growth Industries",
          title: "Director of Business Development",
          email: "m.chen@growthinc.com",
          website: "growthinc.com",
          linkedin: "linkedin.com/in/michaelchen",
          industry: "Manufacturing",
          score: 87,
        },
        {
          id: "3",
          name: "Emily Rodriguez",
          company: "Digital First Agency",
          title: "Chief Marketing Officer",
          email: "emily@digitalfirst.io",
          phone: "+1 (555) 987-6543",
          website: "digitalfirst.io",
          linkedin: "linkedin.com/in/emilyrodriguez",
          industry: "Marketing",
          score: 95,
        },
        {
          id: "4",
          name: "James Wilson",
          company: "Enterprise Solutions Inc",
          title: "Head of Sales",
          email: "jwilson@enterprise-sol.com",
          website: "enterprise-sol.com",
          industry: "Enterprise Software",
          score: 78,
        },
        {
          id: "5",
          name: "Amanda Foster",
          company: "Startup Ventures",
          title: "Founder & CEO",
          email: "amanda@startupventures.co",
          phone: "+1 (555) 456-7890",
          linkedin: "linkedin.com/in/amandafoster",
          industry: "Venture Capital",
          score: 84,
        },
      ]

      setLeads(mockLeads)
      toast.success(`Found ${mockLeads.length} leads`)
    } catch {
      toast.error("Failed to search leads")
    } finally {
      setIsSearching(false)
    }
  }

  const handleGenerateOutreach = async () => {
    if (selectedLeads.length === 0) {
      toast.error("Please select at least one lead")
      return
    }

    setIsGeneratingOutreach(true)
    try {
      const lead = leads.find((l) => l.id === selectedLeads[0])
      
      // Simulated AI outreach generation
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setOutreachMessage(
        `Hi ${lead?.name.split(" ")[0]},

I noticed ${lead?.company} has been making impressive strides in the ${lead?.industry} space. Your recent work on [specific achievement] caught my attention.

I'm reaching out because we help companies like yours streamline their marketing operations with AI-powered automation. Based on what I've seen, I think there could be a strong fit.

Would you be open to a brief 15-minute call this week to explore if NeuClix could help ${lead?.company} achieve its growth goals?

Best regards,
[Your Name]`
      )
      toast.success("Outreach message generated!")
    } catch {
      toast.error("Failed to generate outreach")
    } finally {
      setIsGeneratingOutreach(false)
    }
  }

  const toggleLeadSelection = (id: string) => {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-600">Hot Lead</Badge>
    if (score >= 80) return <Badge className="bg-yellow-600">Warm Lead</Badge>
    return <Badge variant="secondary">Cold Lead</Badge>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gen Hub</h1>
        <p className="text-muted-foreground">
          B2B lead generation and personalized outreach powered by AI
        </p>
      </div>

      <Tabs defaultValue="search" className="space-y-6">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Search className="w-4 h-4 mr-2" />
            Find Leads
          </TabsTrigger>
          <TabsTrigger value="outreach" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Outreach
          </TabsTrigger>
          <TabsTrigger value="saved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            Saved Leads
          </TabsTrigger>
        </TabsList>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Lead Search Criteria
              </CardTitle>
              <CardDescription>
                Define your ideal customer profile to find matching leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="query">Job Title / Keywords</Label>
                  <Input
                    id="query"
                    placeholder="VP of Marketing, CMO..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="marketing">Marketing/Agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleSearchLeads}
                    disabled={isSearching}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search Leads
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Results */}
          {leads.length > 0 ? (
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-card-foreground">Search Results</CardTitle>
                    <CardDescription>{leads.length} leads found</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => toggleLeadSelection(lead.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedLeads.includes(lead.id)
                          ? "border-primary bg-primary/5"
                          : "border-border bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary font-semibold">
                              {lead.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-card-foreground">{lead.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {lead.title} at {lead.company}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              {lead.email && (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  {lead.email}
                                </span>
                              )}
                              {lead.phone && (
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  {lead.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getScoreBadge(lead.score)}
                          <div className="flex items-center gap-1">
                            {lead.website && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Globe className="w-4 h-4" />
                              </Button>
                            )}
                            {lead.linkedin && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Linkedin className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedLeads.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {selectedLeads.length} lead(s) selected
                    </p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Save to List
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary text-primary-foreground"
                        onClick={handleGenerateOutreach}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Outreach
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Enter search criteria above to find leads
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Outreach Tab */}
        <TabsContent value="outreach" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI Outreach Generator
                </CardTitle>
                <CardDescription>
                  Generate personalized outreach messages for your leads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Lead</Label>
                  <Select>
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue placeholder="Choose a lead" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((lead) => (
                        <SelectItem key={lead.id} value={lead.id}>
                          {lead.name} - {lead.company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Outreach Type</Label>
                  <Select defaultValue="cold">
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cold">Cold Email</SelectItem>
                      <SelectItem value="linkedin">LinkedIn Message</SelectItem>
                      <SelectItem value="followup">Follow-up Email</SelectItem>
                      <SelectItem value="referral">Referral Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select defaultValue="professional">
                    <SelectTrigger className="bg-input border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Key Points to Include</Label>
                  <Textarea
                    placeholder="Mention our AI capabilities, recent case study results..."
                    className="bg-input border-border"
                  />
                </div>

                <Button
                  onClick={handleGenerateOutreach}
                  disabled={isGeneratingOutreach}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isGeneratingOutreach ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Message
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-card-foreground">Generated Message</CardTitle>
                <CardDescription>
                  Review and customize your outreach message
                </CardDescription>
              </CardHeader>
              <CardContent>
                {outreachMessage ? (
                  <div className="space-y-4">
                    <Textarea
                      value={outreachMessage}
                      onChange={(e) => setOutreachMessage(e.target.value)}
                      className="bg-input border-border min-h-[300px]"
                    />
                    <div className="flex items-center gap-2">
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Regenerate
                      </Button>
                      <Button className="flex-1 bg-primary text-primary-foreground">
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Generated message will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Saved Leads Tab */}
        <TabsContent value="saved" className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Saved Lead Lists</CardTitle>
              <CardDescription>
                Manage your saved leads and outreach campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Marketing Directors Q1", count: 45, lastUpdated: "2 days ago" },
                  { name: "Tech Startup Founders", count: 23, lastUpdated: "1 week ago" },
                  { name: "Enterprise Sales Leads", count: 67, lastUpdated: "3 days ago" },
                ].map((list, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-card-foreground">{list.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {list.count} leads | Updated {list.lastUpdated}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View List
                    </Button>
                  </div>
                ))}

                <Button variant="outline" className="w-full bg-transparent">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create New List
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
