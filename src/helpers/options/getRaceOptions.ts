import { editions, campaigns } from '@/data'

export const getRaceOptions = (
  editionId?: string,
  campaignId?: string
): string[] => {
  if (!editionId) return []

  const edition = editions.find(e => e.id === editionId)
  if (!edition) return []

  let races = [...edition.races]

  const campaign = campaignId
    ? campaigns.find(c => c.id === campaignId)
    : null

  const overrides = campaign?.raceOverrides

  if (overrides?.only) {
    return overrides.only
  }

  if (overrides?.remove) {
    races = races.filter(r => !overrides.remove!.includes(r))
  }

  if (overrides?.add) {
    races = Array.from(new Set([...races, ...overrides.add]))
  }

  return races
}
