export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'

export type Session = {
  id: string
  campaignId: string
  date: string // ISO
  title?: string
  notes?: string
  status: SessionStatus
}

export type { CampaignRole } from '@/shared'
