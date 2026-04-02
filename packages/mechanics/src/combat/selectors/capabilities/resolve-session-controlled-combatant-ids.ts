import type { EncounterState } from '@/features/mechanics/domain/combat'

import type { EncounterSessionSeat } from './encounter-capabilities.types'

export type ResolveSessionControlledCombatantIdsArgs = {
  viewerRole: EncounterSessionSeat
  /** Participant `characterId` for `viewerRole === 'player'`; ignored otherwise. */
  playerCharacterId?: string | null
}

/**
 * Which encounter combatants the current session seat may take actions for (move, actions, end turn).
 * Does not include perception POV — see {@link EncounterViewerContext.simulatorViewerMode}.
 */
export function resolveSessionControlledCombatantIds(
  encounter: EncounterState,
  args: ResolveSessionControlledCombatantIdsArgs,
): string[] {
  const { viewerRole, playerCharacterId } = args
  if (viewerRole === 'observer') return []

  const ids: string[] = []
  for (const c of Object.values(encounter.combatantsById)) {
    if (viewerRole === 'dm') {
      if (c.source.kind === 'monster' || c.source.kind === 'npc') ids.push(c.instanceId)
    } else {
      if (c.source.kind === 'pc' && playerCharacterId != null && c.source.sourceId === playerCharacterId) {
        ids.push(c.instanceId)
      }
    }
  }
  return ids
}
