import { editions, settings } from '@/data'
import type { OverrideConfig } from '@/data'

type OptionType = 'races' | 'classes'

/**
 * Get available options for a given edition and setting.
 * Handles edition defaults + setting overrides (only, add, remove)
 */
export const getOptions = (
  type: OptionType,
  editionId?: string,
  settingId?: string
): string[] => {
  if (!editionId) return []

  const edition = editions.find(e => e.id === editionId)
  if (!edition) return []

  // Start with the edition's base list
  let options = [...(edition[type] || [])]

  const setting = settingId ? settings.find(c => c.id === settingId) : null

  const overrides: OverrideConfig | undefined =
    type === 'races' ? setting?.raceOverrides : setting?.classOverrides

  if (!overrides) return options

  // "only" takes priority
  if (overrides.only) return [...overrides.only]

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
