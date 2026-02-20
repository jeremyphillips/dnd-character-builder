import type { Character } from '@/shared/types'
import { getArmorConfigurations, getActiveArmorConfig } from './armorConfigurations'

/**
 * Calculate the character's effective armor class.
 * Uses the stored config preference when available, otherwise picks the highest AC.
 */
export function calculateArmorClass(character: Character, edition: string) {
  if (edition !== '5e') {
    return { value: character.armorClass?.base ?? 10, breakdown: 'Unsupported edition' }
  }

  const configs = getArmorConfigurations(character, edition)
  const active = getActiveArmorConfig(configs, character.combat?.selectedArmorConfigId)

  if (!active) {
    return { value: 10, breakdown: '10 (base)' }
  }

  return { value: active.totalAC, breakdown: active.breakdown }
}
