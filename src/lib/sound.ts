"use client"

// Sound system: duar explosion + TTS acak female/male id-ID
// Cooldown 8s between pop-ups to prevent spam

let audioUnlocked = false
let lastPlayTs = 0
const COOLDOWN_MS = 8000
let duarAudio: HTMLAudioElement | null = null
let prefersReducedMotion = false
// admin-managed sound settings (fetched lazily)
let cachedSoundSettings: { enabled: boolean; volume: number; explosionUrl: string; ttsMode: string } | null = null
let soundSettingsFetchedAt = 0

if (typeof window !== "undefined") {
  prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function isReducedMotion() {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }
  return false
}

export function getSoundEnabled(): boolean {
  if (typeof window === "undefined") return true
  // admin global toggle
  if (cachedSoundSettings && !cachedSoundSettings.enabled) return false
  const v = localStorage.getItem("lkbb-sound-enabled")
  if (v === null) return true
  return v === "true"
}

async function fetchSoundSettings(): Promise<void> {
  if (typeof window === "undefined") return
  const now = Date.now()
  if (now - soundSettingsFetchedAt < 30000 && cachedSoundSettings) return
  try {
    const res = await fetch("/api/cms/settings")
    if (!res.ok) return
    const j = await res.json()
    const map = j.settings || j.map || {}
    const get = (k:string, fb:string)=>{
      const v = map[k]
      if(v===undefined || v===null) return fb
      if(typeof v==="string") return v.replace(/^"|"$/g,"")
      if(typeof v==="object" && v.value!==undefined) return String(v.value).replace(/^"|"$/g,"")
      return String(v).replace(/^"|"$/g,"")
    }
    const enabledStr = get("sound.enabled","true")
    const volStr = get("sound.volume","0.85")
    const exp = get("sound.explosion_url","/sounds/duar.mp3")
    const mode = get("sound.tts_mode","random")
    cachedSoundSettings = {
      enabled: enabledStr!=="false" && enabledStr!=="0",
      volume: (()=>{ const n=parseFloat(volStr); if(isNaN(n)) return 0.85; return n>1? n/100 : n })(),
      explosionUrl: exp || "/sounds/duar.mp3",
      ttsMode: ["random","male","female"].includes(mode) ? mode : "random",
    }
    soundSettingsFetchedAt = now
  } catch {}
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem("lkbb-sound-enabled", String(enabled))
  if (enabled) unlockAudio()
}

export function unlockAudio() {
  if (audioUnlocked) return
  try {
    // fetch settings non-blocking
    fetchSoundSettings().catch(()=>{})
    const url = cachedSoundSettings?.explosionUrl || "/sounds/duar.mp3"
    const vol = cachedSoundSettings?.volume ?? 0.85
    duarAudio = new Audio(url)
    duarAudio.preload = "auto"
    duarAudio.volume = vol
    // Do not autoplay; just prepare. Actual play needs user gesture but we unlock here
    duarAudio.load()
    audioUnlocked = true
    // Also warm up speechSynthesis voices
    if ("speechSynthesis" in window) {
      window.speechSynthesis.getVoices()
    }
  } catch {}
}

// Returns true if actually played, false if cooldown or muted or reduced-motion
export function canPlayNow(): boolean {
  const now = Date.now()
  if (now - lastPlayTs < COOLDOWN_MS) return false
  if (!getSoundEnabled()) return false
  return true
}

export function markPlayed() {
  lastPlayTs = Date.now()
}

export async function playExplosion(): Promise<void> {
  if (!getSoundEnabled()) return
  await fetchSoundSettings()
  const url = cachedSoundSettings?.explosionUrl || "/sounds/duar.mp3"
  const vol = cachedSoundSettings?.volume ?? 0.85
  try {
    if (!duarAudio || duarAudio.src !== url) {
      duarAudio = new Audio(url)
      duarAudio.volume = vol
    } else {
      duarAudio.volume = vol
    }
    duarAudio.currentTime = 0
    await duarAudio.play()
  } catch (e) {
    // Fallback: create new audio
    try {
      const a = new Audio(url)
      a.volume = vol
      await a.play()
    } catch {}
  }
}

export function getRandomIndonesianVoice(): SpeechSynthesisVoice | null {
  if (!("speechSynthesis" in window)) return null
  const voices = window.speechSynthesis.getVoices()
  // Prefer id-ID voices
  let candidates = voices.filter(v => v.lang.toLowerCase().startsWith("id"))
  if (candidates.length === 0) {
    // Fallback to any voice
    candidates = voices
  }
  if (candidates.length === 0) return null
  // If ttsMode is male/female, try to hint
  const mode = cachedSoundSettings?.ttsMode || "random"
  if (mode === "male") {
    const male = candidates.find(v=> /male|pria|laki|david|adi/i.test(v.name))
    if(male) return male
  } else if (mode === "female") {
    const female = candidates.find(v=> /female|wanita|perempuan|google.*indonesia/i.test(v.name))
    if(female) return female
  }
  // Random pick to alternate female/male (if available, voices are mixed; random handles acak)
  const idx = Math.floor(Math.random() * candidates.length)
  return candidates[idx] || null
}

export function speakRandom(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!getSoundEnabled()) {
      resolve()
      return
    }
    if (!("speechSynthesis" in window) || !text || !text.trim()) {
      resolve()
      return
    }
    // Ensure settings loaded
    fetchSoundSettings().catch(()=>{})
    try {
      // Ensure synthesis is resumed (browsers may pause)
      try { window.speechSynthesis.resume() } catch {}
      window.speechSynthesis.cancel()

      const utter = new SpeechSynthesisUtterance(text.trim())
      utter.lang = "id-ID"
      utter.rate = 0.92
      // Random male/female via pitch if mode random: male deeper (0.85), female higher (1.25)
      const mode = cachedSoundSettings?.ttsMode || "random"
      if(mode==="random"){
        const isMale = Math.random() > 0.5
        utter.pitch = isMale ? 0.85 : 1.25
      } else if(mode==="male"){
        utter.pitch = 0.85
      } else if(mode==="female"){
        utter.pitch = 1.25
      } else {
        utter.pitch = 1.0
      }
      utter.volume = 1.0

      // Try to get voices — if empty, wait for onvoiceschanged
      const assignVoice = () => {
        const voice = getRandomIndonesianVoice()
        if (voice) utter.voice = voice
      }
      assignVoice()
      // If no voice yet, wait a bit and retry
      if (!utter.voice) {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length === 0) {
          let waited = 0
          const iv = setInterval(() => {
            const vs = window.speechSynthesis.getVoices()
            if (vs.length > 0 || waited > 10) {
              clearInterval(iv)
              assignVoice()
              doSpeak()
            }
            waited++
          }, 100)
          return
        }
      }
      const doSpeak = () => {
        utter.onend = () => resolve()
        utter.onerror = () => resolve()
        // Unlock requires user gesture — ensure we are in resumed state
        try { window.speechSynthesis.resume() } catch {}
        window.speechSynthesis.speak(utter)
        // Fallback resolve after 6s (longer for longer text)
        setTimeout(resolve, 6500)
      }
      // Some browsers need a small delay after cancel
      setTimeout(doSpeak, 120)
    } catch {
      resolve()
    }
  })
}

// Full sequence: duar explosion (+ wait 1.1s) -> TTS
export async function playNotificationSequence(ttsText: string): Promise<boolean> {
  if (!canPlayNow()) return false
  markPlayed()
  await playExplosion()
  // Wait for explosion effect (1.1s) then TTS
  await new Promise(r => setTimeout(r, 1100))
  await speakRandom(ttsText)
  return true
}

// For testing: allow bypass cooldown via force
export async function playNotificationSequenceForce(ttsText: string): Promise<void> {
  markPlayed()
  await playExplosion()
  await new Promise(r => setTimeout(r, 900))
  await speakRandom(ttsText)
}

export function requestUnlockOnInteraction() {
  if (audioUnlocked) return
  const handler = () => {
    unlockAudio()
    document.removeEventListener("click", handler)
    document.removeEventListener("touchstart", handler)
    document.removeEventListener("keydown", handler)
  }
  document.addEventListener("click", handler, { once: true })
  document.addEventListener("touchstart", handler, { once: true })
  document.addEventListener("keydown", handler, { once: true })
}
