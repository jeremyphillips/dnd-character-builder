import type { GameSession, GameSessionParticipantRole } from '../domain/game-session.types'

/**
 * Resolves the current user's session seat for encounter permissions.
 * If the user is not in `participants`, falls back to DM when `userId === session.dmUserId`, else observer.
 */
export function resolveGameSessionEncounterSeat(
  session: GameSession,
  userId: string | undefined | null,
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
  return { viewerRole: 'observer', playerCharacterId: null }
}
