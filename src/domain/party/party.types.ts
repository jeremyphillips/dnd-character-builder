/** Party member (character in a campaign party) as returned from the API. */
export type PartyMemberApiRow = {
  _id: string
  name?: string
  race?: string
  class?: string
  level?: number
  imageKey?: string | null
  ownerName?: string
  ownerAvatarUrl?: string
  status?: 'pending' | 'approved'
  campaignMemberId?: string
}

/** Normalized party member for use in the app. */
export type PartyMember = {
  _id: string
  name: string
  race: string
  class: string
  level: number
  imageKey?: string | null
  ownerName: string
  ownerAvatarUrl?: string
  status?: 'pending' | 'approved'
  campaignMemberId?: string
}
