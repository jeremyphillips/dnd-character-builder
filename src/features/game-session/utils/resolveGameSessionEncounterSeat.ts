import type { EncounterState } from '@/features/mechanics/domain/combat'
import { inferPlayerCharacterIdFromEncounterOwnership } from '@/features/mechanics/domain'

import type { GameSession, GameSessionParticipantRole } from '../domain/game-session.types'

export type ResolveGameSessionEncounterSeatOptions = {
  /** Current encounter state — used when `participants` omits non-DM users (common). */
  encounterState?: EncounterState | null
  /** Approved campaign party (`ownerUserId` + character `id`) for ownership inference. */
  partyRoster?: readonly { id: string; ownerUserId: string }[] | null
}

/**
 * Resolves the current user's session seat for encounter permissions.
 * If the user is not in `participants`, falls back to DM when `userId === session.dmUserId`, else
 * tries **roster + encounter** inference for `player`, else observer.
 */
export function resolveGameSessionEncounterSeat(
  session: GameSession,
  userId: string | undefined | null,
  options?: ResolveGameSessionEncounterSeatOptions,
): { viewerRole: GameSessionParticipantRole; playerCharacterId: string | null } {
  if (!userId) {
    return { viewerRole: 'observer', playerCharacterId: null }
  }
  const participant = session.participants.find((p) => p.userId === userId)
  if (participant) {
    return {
      viewerRole: participant.role,
      playerCharacterId: participant.characterId ?? null,
    }
  }
  if (session.dmUserId === userId) {
    return { viewerRole: 'dm', playerCharacterId: null }
  }

  const encounter = options?.encounterState ?? null
  const roster = options?.partyRoster ?? null
  if (encounter && roster?.length) {
    const inferred = inferPlayerCharacterIdFromEncounterOwnership(userId, encounter, roster)
    if (inferred != null) {
      return { viewerRole: 'player', playerCharacterId: inferred }
    }
  }

  return { viewerRole: 'observer', playerCharacterId: null }
}
