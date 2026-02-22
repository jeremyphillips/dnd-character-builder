import type {
  EnchantmentTemplate,
  EnchantmentTemplateEditionDatum,
} from '@/data/equipment/enchantments/enchantmentTemplates.types'
import { resolveEquipmentEdition } from '@/features/equipment/domain'

export function resolveEnchantmentTemplateDatum(
  template: EnchantmentTemplate,
  edition: string,
): EnchantmentTemplateEditionDatum | undefined {
  const resolved = resolveEquipmentEdition(edition)
  return template.editionData.find(d => d.edition === resolved)
}
