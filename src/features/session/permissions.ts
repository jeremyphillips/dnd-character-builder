import type { Session } from './session.types'
import type { CampaignRole } from '@/shared'
import { isUpcomingSession } from './dates'

export const canEditSession = (session: Session, role: CampaignRole | 'admin'): boolean =>
  role === 'admin' || isUpcomingSession(session.date)
