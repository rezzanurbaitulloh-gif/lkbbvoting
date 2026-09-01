export type CompetitionState = "NOT_STARTED" | "REGISTRATION" | "VERIFICATION" | "VOTING_OPEN" | "VOTING_CLOSED" | "RESULT_VERIFICATION" | "RESULT_PUBLISHED" | "COMPLETED"

export type PeletonCategory = "SMP" | "SMA"
export type PeletonStatus = "Draft" | "Pending" | "Verified" | "Rejected" | "Suspended"
export type MemberRole = "Danton" | "Danru" | "Anggota"
export type TransactionStatus = "Success" | "Pending" | "Failed" | "Expired"
export type UserRole = "PUBLIC" | "USER" | "PARTICIPANT" | "ADMIN" | "SUPER_ADMIN"

export interface PeletonMember {
  id: string
  name: string
  role: MemberRole
  photo: string
}

export interface PeletonGalleryItem {
  id: string
  url: string
  caption?: string
}

export interface Peleton {
  id: string
  slug: string
  number: string // e.g. "01"
  name: string // e.g. "SMKN 1 KERTOSONO"
  school: string
  city: string
  province: string
  category: PeletonCategory
  description: string
  image: string
  cover: string
  members: PeletonMember[]
  gallery: PeletonGalleryItem[]
  support: number
  status: PeletonStatus
  verified: boolean
  createdAt: string
}

export interface Judge {
  id: string
  name: string
  role: string
  bio: string
  photo: string
}

export interface Sponsor {
  id: string
  name: string
  tier: "Main Sponsor" | "Official Partner" | "Supporting Partner" | "Media Partner"
  logo: string
  url?: string
}

export interface NewsItem {
  id: string
  slug: string
  title: string
  category: string
  date: string
  author: string
  excerpt: string
  image: string
  content: string
}

export interface Announcement {
  id: string
  title: string
  category: "Important" | "Competition" | "Voting" | "Payment" | "Schedule" | "Result"
  date: string
  content: string
}

export interface FAQ {
  id: string
  category: "Competition" | "Peleton" | "Support" | "Payment" | "Results" | "Technical"
  question: string
  answer: string
}

export interface TimelineStage {
  id: string
  title: string
  date: string
  description: string
  status: "completed" | "current" | "upcoming"
}

export interface Transaction {
  id: string
  date: string
  peletonId: string
  peletonName: string
  amount: number
  supports: number
  method: string
  status: TransactionStatus
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
}
