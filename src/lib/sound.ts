"use client"

// Sound system: duar explosion + TTS acak female/male id-ID
// Cooldown 8s between pop-ups to prevent spam

let audioUnlocked = false
let lastPlayTs = 0
const COOLDOWN_MS = 8000
let duarAudio: HTMLAudioElement | null = null
let prefersReducedMotion = false

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
  const v = localStorage.getItem("lkbb-sound-enabled")
  if (v === null) return true
  return v === "true"
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return
  localStorage.setItem("lkbb-sound-enabled", String(enabled))
  if (enabled) unlockAudio()
}

export function unlockAudio() {
  if (audioUnlocked) return
  try {
    duarAudio = new Audio("/sounds/duar.mp3")
    duarAudio.preload = "auto"
    duarAudio.volume = 0.85
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
  try {
    if (!duarAudio) {
      duarAudio = new Audio("/sounds/duar.mp3")
      duarAudio.volume = 0.85
    }
    duarAudio.currentTime = 0
    await duarAudio.play()
  } catch (e) {
    // Fallback: create new audio
    try {
      const a = new Audio("/sounds/duar.mp3")
      a.volume = 0.85
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
    if (!("speechSynthesis" in window)) {
      resolve()
      return
    }
    try {
      window.speechSynthesis.cancel()
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = "id-ID"
      utter.rate = 0.92
      utter.pitch = 1.0
      utter.volume = 1.0
      const voice = getRandomIndonesianVoice()
      if (voice) utter.voice = voice
      utter.onend = () => resolve()
      utter.onerror = () => resolve()
      // Some browsers need a small delay after cancel
      setTimeout(() => {
        window.speechSynthesis.speak(utter)
      }, 100)
      // Fallback resolve after 5s
      setTimeout(resolve, 5500)
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
