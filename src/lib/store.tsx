"use client"
import React, { createContext, useContext, useEffect, useState } from "react"
import type { Peleton, Transaction } from "./types"

type Theme = "light" | "dark" | "system"

interface AppState {
  theme: Theme
  setTheme: (t: Theme) => void
  favorites: string[]
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  dukunganHistory: Transaction[]
  addTransaction: (tx: Transaction) => void
  currentUser: { name: string; email: string } | null
  login: (email: string) => void
  logout: () => void
}

const Ctx = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [favorites, setFavorites] = useState<string[]>([])
  const [dukunganHistory, setHistory] = useState<Transaction[]>([])
  const [currentUser, setUser] = useState<{name:string,email:string}|null>(null)

  useEffect(()=>{
    const saved = localStorage.getItem("lkbb-theme") as Theme | null
    const fav = localStorage.getItem("lkbb-fav")
    const hist = localStorage.getItem("lkbb-history")
    const user = localStorage.getItem("lkbb-user")
    if(saved) setThemeState(saved)
    if(fav) setFavorites(JSON.parse(fav))
    if(hist) setHistory(JSON.parse(hist))
    if(user) setUser(JSON.parse(user))
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
  const login = (email:string)=> {
    const u={ name: email.split("@")[0], email }
    setUser(u); localStorage.setItem("lkbb-user", JSON.stringify(u))
  }
  const logout = ()=> { setUser(null); localStorage.removeItem("lkbb-user") }

  return <Ctx.Provider value={{ theme, setTheme, favorites, toggleFavorite, isFavorite, dukunganHistory, addTransaction, currentUser, login, logout }}>{children}</Ctx.Provider>
}
export function useApp(){
  const ctx=useContext(Ctx)
  if(!ctx) throw new Error("useApp outside provider")
  return ctx
}
