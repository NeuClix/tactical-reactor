import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import HomePage from "@/components/marketing/home-page"

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect("/dashboard")
  }
  
  // Show the marketing homepage for non-authenticated users
  return <HomePage />
}
