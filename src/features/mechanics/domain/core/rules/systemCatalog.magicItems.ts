/**
 * System magic item catalog — code-defined magic item entries per system ruleset.
 *
 * Wraps the static magic item data from src/data/equipment with content-system
 * metadata (source, imageKey). Campaign-owned custom magic items are stored in
 * the DB and merged at runtime by the magicItemRepo.
 */
import type { MagicItemEntry } from '@/features/content/domain/types';
import type { MagicItem } from '@/data/equipment';
import { magicItems as magicItemData } from '@/data/equipment/magicItems';
import type { ContentSource } from '@/features/content/domain/types';
import type { SystemRulesetId } from './ruleset.types';
import { DEFAULT_SYSTEM_RULESET_ID } from './systemIds';

function toSystemMagicItem(raw: MagicItem): MagicItemEntry {
  return {
    ...raw,
    source: 'system' as ContentSource,
    imageKey: `/assets/system/equipment/magic-items/${raw.id}.webp`,
  };
}

const SYSTEM_MAGIC_ITEMS_SRD_CC_V5_2_1: readonly MagicItemEntry[] = magicItemData.map(toSystemMagicItem);

export const SYSTEM_MAGIC_ITEMS_BY_SYSTEM_ID: Record<SystemRulesetId, readonly MagicItemEntry[]> = {
  [DEFAULT_SYSTEM_RULESET_ID]: SYSTEM_MAGIC_ITEMS_SRD_CC_V5_2_1,
};

export function getSystemMagicItems(systemId: SystemRulesetId): readonly MagicItemEntry[] {
  return SYSTEM_MAGIC_ITEMS_BY_SYSTEM_ID[systemId] ?? [];
}

export function getSystemMagicItem(systemId: SystemRulesetId, id: string): MagicItemEntry | undefined {
  return getSystemMagicItems(systemId).find(m => m.id === id);
}
