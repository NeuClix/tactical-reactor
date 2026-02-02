import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ContentHubContent } from "@/components/content/content-hub-content"

export const metadata = {
  title: "Content Hub",
  description: "AI-powered SEO content creation",
}

export default async function ContentHubPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")
  
  // Get company
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .single()
  
  if (!company) redirect("/auth/login")
  
  // Get active brand profile
  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single()
  
  // Get recent content
  const { data: recentContent } = await supabase
    .from("content")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .limit(10)

  return (
    <ContentHubContent
      companyId={company.id}
      brandProfile={profile}
      recentContent={recentContent || []}
    />
  )
}
