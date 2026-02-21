import type { Session } from './session.types'

export const createSession = (campaignId: string, date: string): Session => ({
  id: crypto.randomUUID(),
  campaignId,
  date,
  status: 'scheduled',
})
