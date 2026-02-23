import type { EnchantmentTemplate } from '@/data/equipment/enchantments/enchantmentTemplates.types'
import { equipment } from '@/data'
import { resolveEnchantmentTemplateDatum } from './resolveEnchantmentTemplate'

/**
 * Return enhancement templates available for a given edition and character
 * level.  Applies edition-specific gating where applicable (e.g. 4e
 * enhancementLevel).  Other editions pass all templates through for now.
 */
export function getAvailableEnhancementTemplates(
  edition: string,
  level: number,
): EnchantmentTemplate[] {
  return equipment.enchantments.enhancementTemplates.filter(t => {
    const datum = resolveEnchantmentTemplateDatum(t, edition)
    if (!datum) return false

    if (datum.enhancementLevel != null && datum.enhancementLevel > level) {
      return false
    }

    return true
  })
}
