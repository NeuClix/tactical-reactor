import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { BrandStrategyContent } from "@/components/brand/brand-strategy-content"

export const metadata = {
  title: "Brand Strategy",
  description: "Define your brand and content strategy to guide the AI",
}

export default async function BrandStrategyPage() {
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
  
  // Get subscription to check if premium features are available
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("company_id", company.id)
    .single()
  
  // Get brand profiles
  const { data: profiles } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("company_id", company.id)
    .order("created_at", { ascending: true })

  const isPremium = subscription?.plan_type && subscription.plan_type !== "free"

  return (
    <BrandStrategyContent
      companyId={company.id}
      profiles={profiles || []}
      isPremium={isPremium}
    />
  )
}
