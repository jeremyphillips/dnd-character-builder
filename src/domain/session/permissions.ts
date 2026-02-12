import type { Session } from './session.types'
import type { CampaignRole } from './session.types'
import { isUpcomingSession } from './dates'

export const canEditSession = (session: Session, role: CampaignRole): boolean =>
  role === 'admin' || isUpcomingSession(session.date)
