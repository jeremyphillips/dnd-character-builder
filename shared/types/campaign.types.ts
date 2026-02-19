export type CampaignMemberStatus =
  | 'pending'
  | 'approved'
  | 'declined'

/** All assignable campaign roles */
export type CampaignRole = 'dm' | 'pc' | 'observer'

/** Roles stored on campaign member docs (observer is a computed state, not stored) */
export type CampaignMemberRole = Exclude<CampaignRole, 'observer'>

export type CampaignCharacterStatus =
  | 'active'
  | 'inactive'
  | 'deceased'

export interface Campaign {
  _id: string
  identity: {
    name?: string
    setting?: string
    edition?: string
    description?: string
  }
  membership: {
    adminId: string
  }
  memberCount: number
}