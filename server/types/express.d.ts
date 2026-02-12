declare namespace Express {
  interface Request {
    userId?: string
    userRole?: 'superadmin' | 'admin' | 'user'

    /** Attached by requireCampaignRole middleware */
    campaign?: import('mongodb').WithId<import('mongodb').Document>
    /** The user's role within the attached campaign ('dm' | 'player' | 'observer' | 'admin') */
    campaignRole?: 'admin' | 'dm' | 'player' | 'observer'
  }
}
