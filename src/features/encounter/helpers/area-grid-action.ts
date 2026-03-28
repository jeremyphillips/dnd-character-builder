import type { CombatActionDefinition } from '@/features/mechanics/domain/encounter'

export type AoeStep = 'none' | 'placing' | 'confirm'

/**
 * True when the encounter should run the AoE origin flow (`aoeOriginCellId`, `aoeStep`).
 * Includes hostile/all-enemies area spells and **place-anchored** attached emanations that reuse the same grid path.
 *
 * @see {@link CombatActionDefinition.attachedEmanation} `anchorMode === 'place'` — origin is persisted on the
 *   battlefield instance via `ResolveCombatActionSelection.aoeOriginCellId` (not a separate field).
 */
export function isAreaGridAction(action: CombatActionDefinition | undefined | null): boolean {
  if (action?.targeting?.kind === 'all-enemies' && action.areaTemplate) return true
  return Boolean(action?.attachedEmanation?.anchorMode === 'place' && action.areaTemplate)
}

export function isSelfCenteredAreaAction(action: CombatActionDefinition | undefined | null): boolean {
  return Boolean(isAreaGridAction(action) && action?.areaPlacement === 'self')
}
