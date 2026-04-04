import type { EncounterState } from '@/features/mechanics/domain/combat'
import {
  getSpacesRegistry,
  resolvePlacementEncounterSpaceId,
} from '@/features/mechanics/domain/combat/space/encounter-spaces'

/**
 * Presentation-only encounter slice: one tactical scene and placements on that scene.
 * Authoritative state remains unmutated in callers; this is for grid / perception display.
 */
export function buildPresentationEncounterStateForFocusedSpace(
  authoritative: EncounterState,
  focusedEncounterSpaceId: string,
): EncounterState {
  const reg = getSpacesRegistry(authoritative)
  const space = reg[focusedEncounterSpaceId] ?? authoritative.space
  if (!space) return authoritative

  const placements = (authoritative.placements ?? []).filter((p) => {
    const sid = resolvePlacementEncounterSpaceId(authoritative, p)
    return sid === focusedEncounterSpaceId
  })

  return {
    ...authoritative,
    space,
    placements,
  }
}
