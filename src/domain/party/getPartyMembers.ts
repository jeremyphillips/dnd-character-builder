import type { PartyMember, PartyMemberApiRow } from './party.types'

export type GetPartyMembersFetch = (
  campaignId: string
) => Promise<{ characters?: PartyMemberApiRow[] }>

/**
 * Retrieves all party members for a campaign.
 * @param campaignId - Campaign ID
 * @param fetchParty - Function that fetches party data (e.g. () => apiFetch(`/api/campaigns/${campaignId}/party`))
 * @returns Normalized list of party members
 */
export async function getPartyMembers(
  campaignId: string,
  fetchParty: GetPartyMembersFetch
): Promise<PartyMember[]> {
  if (!campaignId) return []
  const data = await fetchParty(campaignId)
  const rows = data.characters ?? []
  return rows.map((c) => ({
    _id: c._id,
    name: c.name ?? 'Unnamed',
    race: c.race ?? '—',
    class: c.class ?? '—',
    level: c.level ?? 1,
    ownerName: c.ownerName ?? 'Unknown',
    status: c.status ?? 'approved',
    campaignMemberId: c.campaignMemberId,
  }))
}
