"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import type { Peleton, Transaction } from "./types"
import { createBrowserSupabase } from "./supabase"

type Theme = "light" | "dark" | "system"

type AuthUser = { id: string; name: string; email: string; role: string | null }

interface AppState {
  theme: Theme
  setTheme: (t: Theme) => void
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  dukunganHistory: Transaction[]
  addTransaction: (tx: Transaction) => void
  currentUser: AuthUser | null
  isAdmin: boolean
  loadingAuth: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  loginWithPassword: (email: string, password: string) => Promise<{ error?: string }>
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [favorites, setFavorites] = useState<string[]>([])
  const [dukunganHistory, setHistory] = useState<Transaction[]>([])
  const [currentUser, setUser] = useState<AuthUser | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  const supabase = createBrowserSupabase()

  const refreshUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUser(null); setLoadingAuth(false); return }
    const { data: profile } = await supabase.from("profiles").select("role, public_name").eq("id", user.id).single()
    setUser({
      id: user.id,
      email: user.email || "",
      name: profile?.public_name || user.email?.split("@")[0] || "User",
      role: profile?.role || "USER",
    })
    setLoadingAuth(false)
  }

  useEffect(()=>{
    const saved = localStorage.getItem("lkbb-theme") as Theme | null
    const fav = localStorage.getItem("lkbb-fav")
    const hist = localStorage.getItem("lkbb-history")
    if(saved) setThemeState(saved)
    if(fav) try{ setFavorites(JSON.parse(fav)) } catch{}
    if(hist) try{ setHistory(JSON.parse(hist)) } catch{}
    refreshUser()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(()=> { refreshUser() })
    return ()=> subscription.unsubscribe()
  },[])

  useEffect(()=>{
    const root = document.documentElement
    const actual = theme==="system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark":"light") : theme
    if(actual==="dark") root.classList.add("dark")
    else root.classList.remove("dark")
    localStorage.setItem("lkbb-theme", theme)
  },[theme])

  const setTheme = (t:Theme)=> setThemeState(t)
  const toggleFavorite = (id:string)=> {
    setFavorites(prev=> {
      const next = prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]
      localStorage.setItem("lkbb-fav", JSON.stringify(next))
      return next
    })
  }
  const isFavorite = (id:string)=> favorites.includes(id)
  const addTransaction = (tx:Transaction)=> {
    setHistory(prev=>{
      const next=[tx,...prev]
      localStorage.setItem("lkbb-history", JSON.stringify(next))
      return next
    })
  }
  const login = async (email:string, password:string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    await refreshUser()
    return {}
  }
  const loginWithPassword = login
  const signUp = async (name:string, email:string, password:string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    if (data.user) {
      // Create profile — RLS allows insert via service? Actually need to handle via trigger or client insert with policy.
      // Try client insert; if fails, profile will be created by trigger.
      await supabase.from("profiles").insert({ id: data.user.id, email, public_name: name, role: "USER" })
      await refreshUser()
    }
    return {}
  }
  const logout = async ()=> {
    await supabase.auth.signOut()
    setUser(null)
  }

  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPER_ADMIN"

  return <Ctx.Provider value={{ theme, setTheme, favorites, toggleFavorite, isFavorite, dukunganHistory, addTransaction, currentUser, isAdmin, loadingAuth, login, loginWithPassword, signUp, logout, refreshUser }}>{children}</Ctx.Provider>
}
export function useApp(){
  const ctx=useContext(Ctx)
  if(!ctx) throw new Error("useApp outside provider")
  return ctx
}
