/**
 * System gear catalog — code-defined gear entries per system ruleset.
 *
 * Wraps the static gear data from src/data/equipment with content-system
 * metadata (source, imageKey). Campaign-owned custom gear is stored in
 * the DB and merged at runtime by the gearRepo.
 */
import type { Gear } from '@/features/content/domain/types';
import type { GearItem } from '@/data/equipment';
import { gear as gearData } from '@/data/equipment/gear';
import type { ContentSource } from '@/features/content/domain/types';
import type { SystemRulesetId } from './ruleset.types';

function toSystemGear(raw: GearItem): Gear {
  return {
    ...raw,
    source: 'system' as ContentSource,
    imageKey: `/assets/system/equipment/gear/${raw.id}.webp`,
  };
}

const SYSTEM_GEAR_5E_V1: readonly Gear[] = gearData.map(toSystemGear);

export const SYSTEM_GEAR_BY_SYSTEM_ID: Record<SystemRulesetId, readonly Gear[]> = {
  '5e_v1': SYSTEM_GEAR_5E_V1,
};

export function getSystemGear(systemId: SystemRulesetId): readonly Gear[] {
  return SYSTEM_GEAR_BY_SYSTEM_ID[systemId] ?? [];
}

export function getSystemGearEntry(systemId: SystemRulesetId, id: string): Gear | undefined {
  return getSystemGear(systemId).find(g => g.id === id);
}
