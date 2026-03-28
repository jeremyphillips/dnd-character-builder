import type { EncounterSpace, CombatantPosition } from '@/features/encounter/space'
import { findGridObstacleById, getCellById, getCellForCombatant } from '@/features/encounter/space'

/**
 * Spatial attachment for a persistent battlefield effect (emanation / aura footprint).
 * Separate from {@link AttachedBattlefieldEffectSource} (who authored the effect) and from the casting combatant.
 */
export type BattlefieldEffectAnchor =
  | { kind: 'creature'; combatantId: string }
  | { kind: 'place'; cellId: string }
  | { kind: 'object'; objectId: string; snapshotCellId?: string }

/**
 * Resolves the grid cell that currently defines the center of the effect's sphere.
 * Returns undefined when spatial data is missing or the anchor cannot be placed (e.g. object without snapshot).
 */
export function resolveBattlefieldEffectOriginCellId(
  space: EncounterSpace | undefined,
  placements: CombatantPosition[] | undefined,
  anchor: BattlefieldEffectAnchor,
): string | undefined {
  if (!space || !placements) return undefined
  switch (anchor.kind) {
    case 'creature':
      return getCellForCombatant(placements, anchor.combatantId)
    case 'place':
      return getCellById(space, anchor.cellId) ? anchor.cellId : undefined
    case 'object': {
      if (anchor.snapshotCellId && getCellById(space, anchor.snapshotCellId)) {
        return anchor.snapshotCellId
      }
      const live = findGridObstacleById(space, anchor.objectId)
      return live && getCellById(space, live.cellId) ? live.cellId : undefined
    }
    default:
      return undefined
  }
}
