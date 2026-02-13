import { editions, settings } from '@/data'
import type { OverrideConfig } from '@/data'
import type { EditionId, SettingId } from '@/data/types'
import { resolveClassId } from '@/domain/character/classAliases'

type OptionType = 'races' | 'classes'

/**
 * Get available options for a given edition and setting.
 * Handles edition defaults + setting overrides (only, add, remove).
 * For classes, edition-specific IDs are resolved to canonical catalog IDs
 * via the alias map (e.g. "fighting-man" -> "fighter", "mage" -> "wizard").
 */
export const getOptions = (
  type: OptionType,
  editionId?: EditionId,
  settingId?: SettingId
): string[] => {
  if (!editionId) return []

  const edition = editions.find(e => e.id === editionId)
  if (!edition) return []

  // Start with the edition's base list
  let options = [...(edition[type] || [])]

  const setting = settingId ? settings.find(c => c.id === settingId) : null

  const overrides: OverrideConfig | undefined =
    type === 'races' ? setting?.raceOverrides : setting?.classOverrides

  if (overrides) {
    // "only" takes priority
    if (overrides.only) {
      options = [...overrides.only]
    } else {
      // Remove any options listed in "remove"
      if (overrides.remove) {
        options = options.filter(o => !overrides.remove!.includes(o))
      }

      // Add any options listed in "add"
      if (overrides.add) {
        options = Array.from(new Set([...options, ...overrides.add]))
      }
    }
  }

  // Resolve edition-specific class IDs to canonical catalog IDs
  if (type === 'classes') {
    options = options.map(resolveClassId)
  }

  return options
}
