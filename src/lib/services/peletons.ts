/**
 * Peleton service abstraction — demo data today, Supabase tomorrow.
 * Keeps UI free of hardcoded data scattering.
 */

import { peletons, getRankedPeletons, getPeletonBySlug } from "../data"
import type { Peleton } from "../types"

export async function listPeletons(opts?: { category?: "SMP"|"SMA"; verifiedOnly?: boolean; search?: string; sort?: "populer"|"terbaru"|"az" }): Promise<Peleton[]> {
  let list = [...peletons]
  if(opts?.verifiedOnly) list = list.filter(p=>p.verified)
  if(opts?.category) list = list.filter(p=>p.category===opts.category)
  if(opts?.search) {
    const q = opts.search.toLowerCase()
    list = list.filter(p=> `${p.name} ${p.school} ${p.city}`.toLowerCase().includes(q))
  }
  if(opts?.sort==="populer") list.sort((a,b)=>b.support-a.support)
  if(opts?.sort==="az") list.sort((a,b)=>a.name.localeCompare(b.name))
  if(opts?.sort==="terbaru") list.sort((a,b)=> new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  return list
}

export async function getPeleton(slug: string): Promise<Peleton | undefined> {
  return getPeletonBySlug(slug)
}

export async function getRanking(category?: "SMP"|"SMA"): Promise<Peleton[]> {
  return getRankedPeletons(category)
}

// Replace later with Supabase:
// export async function listPeletonsSupabase() {
//   const supabase = createClient()
//   const { data } = await supabase.from("peletons").select("*").eq("status","Verified").order("support", {ascending:false})
//   return data
// }
