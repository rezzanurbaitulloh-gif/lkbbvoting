// src/lib/cms.ts — CMS fetcher (server + client)
// Provides helpers to read dynamic pages/sections/settings with fallback

import { createStaticSupabase, createServerSupabase } from "./supabase"

export type CmsPage = {
  id: string
  slug: string
  title: string
  description?: string | null
  is_system: boolean
  is_published: boolean
  seo_title?: string | null
  seo_description?: string | null
  seo_image?: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export type CmsSection = {
  id: string
  page_id: string
  key: string
  title: string
  type: string
  is_visible: boolean
  sort_order: number
  settings: Record<string, any>
  content: Record<string, any>
  created_at: string
  updated_at: string
}

export type SiteSetting = {
  key: string
  value: any
  category: string
  description?: string | null
  is_public: boolean
}

// ——— Public (no auth) ———
export async function getPublishedPages(): Promise<CmsPage[]> {
  const supabase = createStaticSupabase()
  const { data } = await supabase.from("cms_pages").select("*").eq("is_published", true).order("sort_order", { ascending: true })
  return (data as any) || []
}

export async function getPageBySlug(slug: string): Promise<CmsPage | null> {
  const supabase = createStaticSupabase()
  const { data } = await supabase.from("cms_pages").select("*").eq("slug", slug).single()
  return (data as any) || null
}

export async function getSectionsForPage(slug: string, onlyVisible = true): Promise<CmsSection[]> {
  const supabase = createStaticSupabase()
  // join via page_id
  const { data: page } = await supabase.from("cms_pages").select("id").eq("slug", slug).single()
  if (!page) return []
  let q = supabase.from("cms_sections").select("*").eq("page_id", (page as any).id).order("sort_order", { ascending: true })
  if (onlyVisible) q = q.eq("is_visible", true)
  const { data } = await q
  return (data as any) || []
}

// Helper: fetch all sections for home in one call
export async function getHomeSections(): Promise<CmsSection[]> {
  return getSectionsForPage("home", true)
}

// Site settings — public only
export async function getPublicSettings(): Promise<Record<string, any>> {
  const supabase = createStaticSupabase()
  const { data } = await supabase.from("site_settings").select("key,value").eq("is_public", true)
  const map: Record<string, any> = {}
  for (const row of (data as any) || []) {
    // value is jsonb — may be stringified json or object; normalize
    let v: any = (row as any).value
    // If value is a JSON string that itself is quoted, supabase already parses jsonb; so v is the inner value
    map[row.key] = v
  }
  return map
}

export async function getSetting(key: string, fallback?: any): Promise<any> {
  const supabase = createStaticSupabase()
  const { data } = await supabase.from("site_settings").select("value").eq("key", key).single()
  if (!data) return fallback
  return (data as any).value ?? fallback
}

// Server-component version (uses cookies for draft preview / admin)
export async function getSectionsForPageServer(slug: string, onlyVisible = true) {
  try {
    const supabase = await createServerSupabase()
    const { data: page } = await supabase.from("cms_pages").select("id").eq("slug", slug).single()
    if (!page) return []
    let q = supabase.from("cms_sections").select("*").eq("page_id", (page as any).id).order("sort_order", { ascending: true })
    if (onlyVisible) q = q.eq("is_visible", true)
    const { data } = await q
    return (data as any) || []
  } catch {
    return getSectionsForPage(slug, onlyVisible)
  }
}

// Utility: get content field with fallback chain: section.content[key] -> fallback -> ""
export function getContent(section: CmsSection | undefined, key: string, fallback: any = "") {
  if (!section) return fallback
  const v = (section.content as any)?.[key]
  return v !== undefined && v !== null && v !== "" ? v : fallback
}
