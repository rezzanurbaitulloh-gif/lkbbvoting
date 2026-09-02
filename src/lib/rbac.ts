// src/lib/rbac.ts — RBAC helpers for Dynamic CMS
// Re-usable server-side + client-side permission checks

export const ALL_PERMISSIONS = [
  "cms.pages.read","cms.pages.write","cms.sections.read","cms.sections.write","cms.sections.publish",
  "media.read","media.upload","media.delete",
  "settings.read","settings.write",
  "users.read","users.manage","users.permissions",
  "peletons.read","peletons.write",
  "transactions.read","transactions.manage",
  "system.audit","system.admin",
] as const

export type PermissionKey = typeof ALL_PERMISSIONS[number]

export const ROLE_DEFAULTS: Record<string, PermissionKey[]> = {
  SUPER_ADMIN: [...ALL_PERMISSIONS],
  ADMIN: [
    "cms.pages.read","cms.pages.write","cms.sections.read","cms.sections.write","cms.sections.publish",
    "media.read","media.upload","media.delete",
    "settings.read","settings.write",
    "users.read","users.manage",
    "peletons.read","peletons.write",
    "transactions.read","transactions.manage",
    "system.audit",
  ],
  EDITOR: [
    "cms.pages.read","cms.pages.write","cms.sections.read","cms.sections.write","cms.sections.publish",
    "media.read","media.upload",
    "settings.read",
    "peletons.read","peletons.write",
    "transactions.read",
  ],
  USER: [],
  PARTICIPANT: [],
}

export function hasPermission(role: string | null | undefined, key: PermissionKey): boolean {
  if (!role) return false
  if (role === "SUPER_ADMIN") return true
  const perms = ROLE_DEFAULTS[role]
  return perms ? perms.includes(key) : false
}

export function canAccessAdmin(role: string | null | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN" || role === "EDITOR"
}

// Server-side: fetch role_permissions override from DB (optional)
// If row exists in role_permissions, it overrides default
export async function checkPermissionDB(
  supabase: any,
  userId: string,
  role: string,
  required: PermissionKey
): Promise<boolean> {
  if (role === "SUPER_ADMIN") return true
  // check user override first
  try {
    const { data: userPerm } = await supabase.from("user_permissions").select("granted").eq("user_id", userId).eq("permission_key", required).single()
    if (userPerm) return !!userPerm.granted
  } catch {}
  // check role override
  try {
    const { data: rolePerm } = await supabase.from("role_permissions").select("granted").eq("role", role).eq("permission_key", required).single()
    if (rolePerm) return !!rolePerm.granted
  } catch {}
  // fallback to defaults
  return hasPermission(role, required)
}

// Middleware helper — list routes that require specific permission
export const ROUTE_PERMISSIONS: Record<string, PermissionKey> = {
  "/admin/cms": "cms.pages.read",
  "/admin/media": "media.read",
  "/admin/settings": "settings.read",
  "/admin/access": "users.permissions",
  "/admin/users": "users.read",
  "/admin/roles": "users.read",
}
