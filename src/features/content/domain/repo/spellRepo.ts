/**
 * Spell repository — merges system + campaign spells + content patches.
 *
 * Resolution order:
 * 1) Campaign-owned entry (full override)
 * 2) System entry + campaign patch (merged via applyContentPatch)
 * 3) Raw system entry
 */
import type { Spell } from '../types/spell.types';
import type { SystemRulesetId } from '@/features/mechanics/domain/core/rules';
import { getSystemSpells, getSystemSpell } from '@/features/mechanics/domain/core/rules/systemCatalog.spells';
import {
  listCampaignSpells,
  getCampaignSpell,
  createCampaignSpell,
  updateCampaignSpell,
  deleteCampaignSpell,
} from '../campaignSpellRepo';
import { getContentPatch } from '../contentPatchRepo';
import { applyContentPatch } from '../patches/applyContentPatch';

/** Spell shape for list view (Spell has all needed fields). */
export type SpellSummary = Spell;

function matchesSearch(name: string, search: string): boolean {
  return name.toLowerCase().includes(search.toLowerCase());
}

export const spellRepo = {
  async listSummaries(
    campaignId: string,
    systemId: SystemRulesetId,
    opts?: { search?: string },
  ): Promise<SpellSummary[]> {
    const [system, campaign, contentPatch] = await Promise.all([
      Promise.resolve(getSystemSpells(systemId)),
      listCampaignSpells(campaignId),
      getContentPatch(campaignId),
    ]);

    const spellPatches = contentPatch?.patches?.spells ?? {};
    const campaignIds = new Set(campaign.map((c) => c.id));

    const patchedSystem: Spell[] = system
      .filter((s) => !campaignIds.has(s.id))
      .map((s): Spell => {
        const patch = spellPatches[s.id];
        if (!patch) return s;
        const merged = applyContentPatch<Spell>(s, patch as Partial<Spell>);
        return { ...merged, patched: true };
      });

    const merged: Spell[] = [...patchedSystem, ...campaign];

    let results = [...merged];

    if (opts?.search) {
      results = results.filter((s) => matchesSearch(s.name, opts.search!));
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getEntry(
    campaignId: string,
    systemId: SystemRulesetId,
    id: string,
  ): Promise<Spell | null> {
    const campaignEntry = await getCampaignSpell(campaignId, id);
    if (campaignEntry) return campaignEntry;

    const systemSpell = getSystemSpell(systemId, id) ?? null;
    if (!systemSpell) return null;

    const contentPatch = await getContentPatch(campaignId);
    const spellPatch = contentPatch?.patches?.spells?.[id];
    if (!spellPatch) return systemSpell;

    const merged = applyContentPatch<Spell>(systemSpell, spellPatch as Partial<Spell>);
    return { ...merged, patched: true };
  },

  async createEntry(
    campaignId: string,
    input: Parameters<typeof createCampaignSpell>[1],
  ): Promise<Spell> {
    const result = await createCampaignSpell(campaignId, input);
    if ('errors' in result) {
      throw new Error(result.errors.map((e) => e.message).join('; '));
    }
    return result.spell;
  },

  async updateEntry(
    campaignId: string,
    id: string,
    input: Parameters<typeof updateCampaignSpell>[2],
  ): Promise<Spell> {
    const result = await updateCampaignSpell(campaignId, id, input);
    if ('errors' in result) {
      throw new Error(result.errors.map((e) => e.message).join('; '));
    }
    return result.spell;
  },

  async deleteEntry(
    campaignId: string,
    id: string,
  ): Promise<boolean> {
    return deleteCampaignSpell(campaignId, id);
  },
};
