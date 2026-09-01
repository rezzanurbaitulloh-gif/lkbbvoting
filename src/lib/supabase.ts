import { createBrowserClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

export function createBrowserSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createServerSupabase() {
  // For API routes / server components — uses anon for read, service_role for writes via env
  // In production, use cookies via @supabase/ssr createServerClient
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createServiceSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
