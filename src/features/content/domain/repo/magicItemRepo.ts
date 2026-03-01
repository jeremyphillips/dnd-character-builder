// ---------------------------------------------------------------------------
// Resolution order:
// 1) Campaign-owned entry (full override)
// 2) System entry + campaign patch (merged via applyContentPatch)
// 3) Raw system entry
// ---------------------------------------------------------------------------

import type { CampaignContentRepo, ListOptions } from './contentRepo.types';
import type { MagicItemEntry, MagicItemSummary, MagicItemInput } from '../types/magicItem.types';
import { getSystemMagicItems, getSystemMagicItem } from '@/features/mechanics/domain/core/rules/systemCatalog.magicItems';
import { campaignMagicItemRepo, type CampaignEquipmentEntry } from '../campaignEquipmentRepo';
import { getContentPatch } from '../contentPatchRepo';
import { applyContentPatch } from '../patches/applyContentPatch';
import { moneyToCp } from '@/shared/money';
import type { ContentSource } from '../types';
import type { SystemRulesetId } from '@/features/mechanics/domain/core/rules';

function toSummary(item: MagicItemEntry): MagicItemSummary {
  return {
    id: item.id,
    name: item.name,
    source: item.source,
    imageKey: item.imageKey,
    accessPolicy: item.accessPolicy,
    patched: item.patched,
    slot: item.slot,
    costCp: moneyToCp(item.cost),
    rarity: item.rarity,
    requiresAttunement: item.requiresAttunement ?? false,
  };
}

function campaignEntryToMagicItem(e: CampaignEquipmentEntry): MagicItemEntry {
  const d = e.data ?? {};
  return {
    id: e.id,
    name: e.name,
    description: e.description,
    imageKey: e.imageKey,
    source: 'campaign' as ContentSource,
    campaignId: e.campaignId,
    accessPolicy: e.accessPolicy,
    cost: d.cost as MagicItemEntry['cost'],
    weight: d.weight as MagicItemEntry['weight'],
    slot: (d.slot as MagicItemEntry['slot']) ?? 'wondrous',
    rarity: d.rarity as MagicItemEntry['rarity'],
    requiresAttunement: d.requiresAttunement as boolean | undefined,
    bonus: d.bonus as number | undefined,
    charges: d.charges as number | undefined,
    effects: d.effects as MagicItemEntry['effects'],
  };
}

function matchesSearch(name: string, search: string): boolean {
  return name.toLowerCase().includes(search.toLowerCase());
}

export const magicItemRepo: CampaignContentRepo<MagicItemEntry, MagicItemSummary, MagicItemInput> = {

  async listSummaries(
    campaignId: string,
    systemId: SystemRulesetId,
    opts?: ListOptions,
  ): Promise<MagicItemSummary[]> {
    const [system, campaign, contentPatch] = await Promise.all([
      Promise.resolve(getSystemMagicItems(systemId)),
      campaignMagicItemRepo.list(campaignId),
      getContentPatch(campaignId),
    ]);

    const magicItemPatches = contentPatch?.patches?.magicItems ?? {};
    const campaignIds = new Set(campaign.map(c => c.id));

    const patchedSystem: MagicItemEntry[] = system
      .filter(m => !campaignIds.has(m.id))
      .map((m): MagicItemEntry => {
        const patch = magicItemPatches[m.id];
        if (!patch) return m;
        const merged = applyContentPatch<MagicItemEntry>(m, patch as Partial<MagicItemEntry>);
        return { ...merged, patched: true };
      });

    const merged: MagicItemEntry[] = [
      ...patchedSystem,
      ...campaign.map(campaignEntryToMagicItem),
    ];

    let results = merged.map(toSummary);

    if (opts?.search) {
      results = results.filter(r => matchesSearch(r.name, opts.search!));
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getEntry(
    campaignId: string,
    systemId: SystemRulesetId,
    id: string,
  ): Promise<MagicItemEntry | null> {
    const campaignEntry = await campaignMagicItemRepo.get(campaignId, id);
    if (campaignEntry) return campaignEntryToMagicItem(campaignEntry);

    const systemItem = getSystemMagicItem(systemId, id) ?? null;
    if (!systemItem) return null;

    const contentPatch = await getContentPatch(campaignId);
    const itemPatch = contentPatch?.patches?.magicItems?.[id];
    if (!itemPatch) return systemItem;

    const merged = applyContentPatch<MagicItemEntry>(systemItem, itemPatch as Partial<MagicItemEntry>);
    return { ...merged, patched: true };
  },

  async createEntry(
    campaignId: string,
    input: MagicItemInput,
  ): Promise<MagicItemEntry> {
    const { name, description, accessPolicy, ...rest } = input;
    const result = await campaignMagicItemRepo.create(campaignId, {
      name,
      description: description ?? '',
      imageKey: (rest as Record<string, unknown>).imageKey ?? '',
      accessPolicy,
      data: rest,
    });
    if ('errors' in result) {
      throw new Error(result.errors.map(e => e.message).join('; '));
    }
    return campaignEntryToMagicItem(result.entry);
  },

  async updateEntry(
    campaignId: string,
    id: string,
    input: MagicItemInput,
  ): Promise<MagicItemEntry> {
    const { name, description, accessPolicy, ...rest } = input;
    const result = await campaignMagicItemRepo.update(campaignId, id, {
      name,
      description: description ?? '',
      imageKey: (rest as Record<string, unknown>).imageKey ?? '',
      accessPolicy,
      data: rest,
    });
    if ('errors' in result) {
      throw new Error(result.errors.map(e => e.message).join('; '));
    }
    return campaignEntryToMagicItem(result.entry);
  },

  async deleteEntry(
    campaignId: string,
    id: string,
  ): Promise<boolean> {
    return campaignMagicItemRepo.remove(campaignId, id);
  },
};
