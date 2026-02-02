import { createClient } from "@/lib/supabase/server"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Get company data
  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user?.id)
    .single()
  
  // Get subscription status - create default if doesn't exist
  let { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("company_id", company?.id)
    .single()

  // If no subscription exists, create a free one
  if (!subscription && company?.id) {
    const { data: newSub } = await supabase
      .from("subscriptions")
      .insert({
        company_id: company.id,
        plan: "free",
        status: "active",
        credits_remaining: 100,
        credits_monthly: 100,
      })
      .select()
      .single()
    subscription = newSub
  }
  
  // Get recent content count
  const { count: contentCount } = await supabase
    .from("content")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id)
  
  // Get recent media count  
  const { count: mediaCount } = await supabase
    .from("media")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id)
  
  // Get leads count
  const { count: leadsCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id)
  
  // Get brand profiles count
  const { count: profilesCount } = await supabase
    .from("brand_profiles")
    .select("*", { count: "exact", head: true })
    .eq("company_id", company?.id)

  return (
    <DashboardContent
      companyName={company?.name || "Your Company"}
      subscription={subscription}
      stats={{
        contentCount: contentCount || 0,
        mediaCount: mediaCount || 0,
        leadsCount: leadsCount || 0,
        profilesCount: profilesCount || 0,
      }}
    />
  )
}
