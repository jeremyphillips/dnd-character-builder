/**
 * System armor catalog — code-defined armor entries per system ruleset.
 *
 * Wraps the static armor data from src/data/equipment with content-system
 * metadata (source, imageKey). Campaign-owned custom armor is stored in
 * the DB and merged at runtime by the armorRepo.
 */
import type { Armor } from '@/features/content/domain/types';
import type { ArmorItem } from '@/data/equipment';
import { armor as armorData } from '@/data/equipment/armor';
import type { ContentSource } from '@/features/content/domain/types';
import type { SystemRulesetId } from './ruleset.types';
import { DEFAULT_SYSTEM_RULESET_ID } from './systemIds';

function toSystemArmor(raw: ArmorItem): Armor {
  return {
    ...raw,
    source: 'system' as ContentSource,
    imageKey: `/assets/system/equipment/armor/${raw.id}.webp`,
  };
}

const SYSTEM_ARMOR_SRD_CC_V5_2_1: readonly Armor[] = armorData.map(toSystemArmor);

export const SYSTEM_ARMOR_BY_SYSTEM_ID: Record<SystemRulesetId, readonly Armor[]> = {
  [DEFAULT_SYSTEM_RULESET_ID]: SYSTEM_ARMOR_SRD_CC_V5_2_1,
};

export function getSystemArmor(systemId: SystemRulesetId): readonly Armor[] {
  return SYSTEM_ARMOR_BY_SYSTEM_ID[systemId] ?? [];
}

export function getSystemArmorEntry(systemId: SystemRulesetId, id: string): Armor | undefined {
  return getSystemArmor(systemId).find(a => a.id === id);
}
