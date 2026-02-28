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

function toSystemMagicItem(raw: MagicItem): MagicItemEntry {
  return {
    ...raw,
    source: 'system' as ContentSource,
    imageKey: `/assets/system/equipment/magic-items/${raw.id}.webp`,
  };
}

const SYSTEM_MAGIC_ITEMS_5E_V1: readonly MagicItemEntry[] = magicItemData.map(toSystemMagicItem);

export const SYSTEM_MAGIC_ITEMS_BY_SYSTEM_ID: Record<SystemRulesetId, readonly MagicItemEntry[]> = {
  '5e_v1': SYSTEM_MAGIC_ITEMS_5E_V1,
};

export function getSystemMagicItems(systemId: SystemRulesetId): readonly MagicItemEntry[] {
  return SYSTEM_MAGIC_ITEMS_BY_SYSTEM_ID[systemId] ?? [];
}

export function getSystemMagicItem(systemId: SystemRulesetId, id: string): MagicItemEntry | undefined {
  return getSystemMagicItems(systemId).find(m => m.id === id);
}
