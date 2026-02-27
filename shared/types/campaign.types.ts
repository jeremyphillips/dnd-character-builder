export type CampaignMemberStatus =
  | 'pending'
  | 'approved'
  | 'declined'

/** All campaign-scoped viewer roles (never includes platform-level concepts). */
export type CampaignRole = 'dm' | 'pc' | 'observer'

/**
 * Roles that may be stored on CampaignMember docs.
 * 'observer' is a computed state (pending member), not stored.
 * 'co_dm' enables future co-DM support.
 */
export type CampaignMemberStoredRole = 'dm' | 'co_dm' | 'pc'

/** @deprecated Use CampaignMemberStoredRole instead. Kept for backward compat. */
export type CampaignMemberRole = Exclude<CampaignRole, 'observer'>

export type CampaignCharacterStatus =
  | 'active'
  | 'inactive'
  | 'deceased'

export type CampaignIdentity = {
  name: string
  setting?: string
  edition?: string
  description?: string
  imageUrl?: string
}

export type CampaignConfiguration = {
  allowLegacyEditionNpcs?: boolean
}

/** Fields common to both the full Campaign document and lightweight summaries. */
export interface CampaignBase {
  _id: string
  identity: CampaignIdentity
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Campaign role as seen by the viewer.
 *
 * 'owner' is a derived value — it is never stored on CampaignMember docs.
 * DM/co-DM derivation will be added in a later stage.
 */
export type ViewerCampaignRole = 'owner' | CampaignRole

/** Viewer-specific context attached by the API when fetching a campaign. */
export interface CampaignViewer {
  campaignRole: ViewerCampaignRole | null
  isPlatformAdmin: boolean
  isOwner: boolean
}

/** Summary counts derived from CampaignMember docs. */
export interface CampaignMembersSummary {
  counts: {
    pending: number
    approved: number
    declined: number
    total: number
  }
  viewerCharacterIds: string[]
}

export interface Campaign extends CampaignBase {
  membership: {
    ownerId: string
  }
  rulesetId?: string
  rulesetVersion?: number
  configuration?: CampaignConfiguration
  /** Populated by GET /api/campaigns/:id with the requesting user's context. */
  viewer?: CampaignViewer
  /** Member summary derived from CampaignMember docs (not legacy fields). */
  members?: CampaignMembersSummary
  createdAt: Date
  updatedAt: Date
}

export interface CampaignSummary extends CampaignBase {
  dmName?: string
  campaignMemberId?: string
  characterStatus?: string
  memberCount?: number
}

export interface PendingMembership {
  campaignId: string
  campaignName: string
  campaignMemberId: string
}
