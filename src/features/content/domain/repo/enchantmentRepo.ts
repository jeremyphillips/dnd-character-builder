/**
 * Enchantment repository — system enhancement templates.
 *
 * System templates come from the code-defined catalog (systemCatalog.enchantments).
 * Campaign-owned custom enchantments would be merged via campaignEnchantmentRepo
 * and buildCampaignCatalog.
 */
import type { EnchantmentTemplate } from '../types';
import { getSystemEnchantmentTemplates, getSystemEnchantmentTemplate } from '@/features/mechanics/domain/core/rules/systemCatalog.enchantments';
import type { SystemRulesetId } from '@/features/mechanics/domain/core/rules';

export const enchantmentRepo = {
  listSystem(systemId: SystemRulesetId): EnchantmentTemplate[] {
    return [...getSystemEnchantmentTemplates(systemId)];
  },

  getSystemById(systemId: SystemRulesetId, id: string): EnchantmentTemplate | null {
    return getSystemEnchantmentTemplate(systemId, id) ?? null;
  },

  // TODO: createEntry — not implemented yet
  // TODO: updateEntry — not implemented yet
  // TODO: deleteEntry — not implemented yet
};
