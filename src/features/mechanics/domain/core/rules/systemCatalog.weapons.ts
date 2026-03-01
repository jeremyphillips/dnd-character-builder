/**
 * System weapon catalog — code-defined weapon entries per system ruleset.
 *
 * Wraps the static weapon data from src/data/equipment with content-system
 * metadata (source, imageKey). Campaign-owned custom weapons are stored in
 * the DB and merged at runtime by the weaponRepo.
 */
import type { Weapon } from '@/features/content/domain/types';
import type { WeaponItem } from '@/data/equipment';
import { weapons as weaponData } from '@/data/equipment/weapons';
import type { ContentSource } from '@/features/content/domain/types';
import type { SystemRulesetId } from './ruleset.types';
import { DEFAULT_SYSTEM_RULESET_ID } from './systemIds';

function toSystemWeapon(raw: WeaponItem): Weapon {
  return {
    ...raw,
    source: 'system' as ContentSource,
    imageKey: `/assets/system/equipment/weapons/${raw.id}.webp`,
  };
}

const SYSTEM_WEAPONS_SRD_CC_V5_2_1: readonly Weapon[] = weaponData.map(toSystemWeapon);

export const SYSTEM_WEAPONS_BY_SYSTEM_ID: Record<SystemRulesetId, readonly Weapon[]> = {
  [DEFAULT_SYSTEM_RULESET_ID]: SYSTEM_WEAPONS_SRD_CC_V5_2_1,
};

export function getSystemWeapons(systemId: SystemRulesetId): readonly Weapon[] {
  return SYSTEM_WEAPONS_BY_SYSTEM_ID[systemId] ?? [];
}

export function getSystemWeapon(systemId: SystemRulesetId, id: string): Weapon | undefined {
  return getSystemWeapons(systemId).find(w => w.id === id);
}
