import type { CampaignRole } from '../../shared/types'

declare namespace Express {
  interface Request {
    userId?: string
    userRole?: 'superadmin' | 'admin' | 'user'

    /** Attached by requireCampaignRole middleware */
    campaign?: import('mongodb').WithId<import('mongodb').Document>
    /** The user's effective role within the attached campaign */
    campaignRole?: CampaignRole | 'admin'
  }
}
