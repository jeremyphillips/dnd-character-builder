import type { EncounterState } from '@/features/mechanics/domain/combat'

/**
 * When `GameSession.participants` does not list a logged-in player (common until join flow persists
 * every seat), infer which character they play by intersecting campaign roster ownership with
 * party **pc** combatants present in the encounter.
 */
export function inferPlayerCharacterIdFromEncounterOwnership(
  userId: string,
  encounter: EncounterState,
  partyRoster: readonly { id: string; ownerUserId: string }[],
): string | null {
  const ownedCharacterIds = new Set(
    partyRoster.filter((m) => m.ownerUserId === userId).map((m) => m.id),
  )
  for (const c of Object.values(encounter.combatantsById)) {
    if (c.side !== 'party') continue
    if (c.source.kind !== 'pc') continue
    if (!ownedCharacterIds.has(c.source.sourceId)) continue
    return c.source.sourceId
  }
  return null
}
