import type { GameSession } from '../domain/game-session.types'

/** Stable demo id so smoke tests can open a known URL without API wiring. */
export const DEMO_GAME_SESSION_ID = 'demo'

export function resolveMockGameSession(
  campaignId: string,
  gameSessionId: string,
  dmUserId: string,
): GameSession | null {
  if (gameSessionId !== DEMO_GAME_SESSION_ID) return null

  const now = new Date()
  const scheduled = new Date(now.getTime() + 86400000)

  return {
    id: DEMO_GAME_SESSION_ID,
    campaignId,
    status: 'lobby',
    dmUserId,
    title: 'Demo live session',
    scheduledFor: scheduled.toISOString(),
    location: {
      buildingId: 'b-example',
      floorId: 'floor-2',
      label: 'Example Hall — second floor',
    },
    participants: [
      { userId: dmUserId, role: 'dm', characterId: null },
      { userId: 'player-1', role: 'player', characterId: 'char-1' },
      { userId: 'player-2', role: 'player', characterId: null },
    ],
    activeEncounterId: null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
}
