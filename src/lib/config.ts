// DEPRECATED: competitionConfig hardcodes are FALLBACK defaults only.
// Single source of truth is Supabase competitions table (settings JSONB).
// Do not use these values for business logic; always fetch from DB via /api/event or supabase.
// Kept for build-time fallback and static asset paths only.
export const competitionConfig = {
  name: "LKBB JAVASOMA",
  subtitle: "The Impression",
  tagline: "ASTRA DHARMA HAYUNING BUDAYA",
  organizer: "PASKIBRA SMKN 1 KERTOSONO",
  dates: {
    pendaftaran: "Agustus s.d. Kuota terpenuhi",
    technicalMeeting: "3 Oktober 2026",
    pelaksanaan: "24 Oktober 2026",
    votingStart: "2026-09-15T00:00:00+07:00",
    votingEnd: "2026-10-24T23:59:59+07:00",
  },
  // prices moved to DB: competitions.settings.online_price / offline_price
  // packages moved to DB: competitions.settings.ballot_presets
  get prices() {
    if (typeof window !== "undefined") console.warn("[config] prices is deprecated — use DB")
    return { online: 3000, offline: 5000 }
  },
  get packages() {
    return [
      { supports: 10, price: 30000, label: "10 Dukungan" },
      { supports: 50, price: 150000, label: "50 Dukungan", popular: true },
      { supports: 100, price: 300000, label: "100 Dukungan" },
      { supports: 300, price: 900000, label: "300 Dukungan" },
    ]
  },
  contact: {
    // Fallback only — admin controls via DB competitions.settings.contact/whatsapp
    email: "info@lkbb-event.id",
    whatsapp: "0812-3456-7890",
    whatsappSMP: "081578202646",
    whatsappSMA: "087866882594",
    instagram: "@lkbb_event",
    address: "SMK Negeri 1 Kertosono, Nganjuk, Jawa Timur",
  },
  socials: {
    instagram: "https://instagram.com/lkbb_event",
    youtube: "https://youtube.com/@lkbb",
    tiktok: "https://tiktok.com/@lkbb_event",
  },
  state: "VOTING_OPEN" as const,
}

export const assets = {
  brand: {
    lkbb: "/assets/brand/lkbb-logo.jpg",
    paskibra: "/assets/brand/paskibra-logo.jpg",
    school: "/assets/brand/school-logo.jpg",
  },
  poster: "/assets/poster/lkbb-poster.jpg",
}
