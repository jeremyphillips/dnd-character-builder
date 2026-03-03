/**
 * Campaign enchantment repository — campaign-owned custom enhancement templates.
 *
 * Campaign enchantments are merged with system templates in buildCampaignCatalog.
 * For now, only stubs; create/update/delete are not implemented.
 *
 * TODO: Wire to API when backend supports campaign enchantments.
 * TODO: createEntry — not implemented yet
 * TODO: updateEntry — not implemented yet
 * TODO: deleteEntry — not implemented yet
 */
import type { EnchantmentTemplate } from './types';

// ---------------------------------------------------------------------------
// Campaign entry shape (matches CampaignEquipmentEntry pattern when API exists)
// ---------------------------------------------------------------------------

export type CampaignEnchantmentEntry = {
  id: string;
  name: string;
  description?: string;
  campaignId: string;
  data: Partial<EnchantmentTemplate>;
};

// ---------------------------------------------------------------------------
// Stub implementation — no API yet
// ---------------------------------------------------------------------------

export const campaignEnchantmentRepo = {
  async list(campaignId: string): Promise<CampaignEnchantmentEntry[]> {
    // TODO: Fetch from API when backend supports campaign enchantments
    return [];
  },

  async get(campaignId: string, itemId: string): Promise<CampaignEnchantmentEntry | null> {
    // TODO: Fetch from API when backend supports campaign enchantments
    return null;
  },

  // TODO: create — not implemented yet
  // TODO: update — not implemented yet
  // TODO: remove — not implemented yet
};
