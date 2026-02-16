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
