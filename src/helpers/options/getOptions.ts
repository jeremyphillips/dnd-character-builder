import { editions, campaigns } from '@/data'

type OptionType = 'races' | 'classes'

/**
 * Get available options for a given edition and campaign.
 * Handles edition defaults + campaign overrides (only, add, remove)
 */
export const getOptions = (
  type: OptionType,
  editionId?: string,
  campaignId?: string
): string[] => {
  if (!editionId) return []

  const edition = editions.find(e => e.id === editionId)
  if (!edition) return []

  // Start with the edition's base list
  let options = [...(edition[type] || [])]

  const campaign = campaignId ? campaigns.find(c => c.id === campaignId) : null
  const overrides = type === 'races' ? campaign?.raceOverrides : campaign?.classOverrides

  if (!overrides) return options

  // "only" takes priority
  if (overrides.only) return overrides.only

  // Remove any options listed in "remove"
  if (overrides.remove) {
    options = options.filter(o => !overrides.remove!.includes(o))
  }

  // Add any options listed in "add"
  if (overrides.add) {
    options = Array.from(new Set([...options, ...overrides.add]))
  }

  return options
}
