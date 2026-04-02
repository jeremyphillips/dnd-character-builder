import { getGameSessionLobbyPresentUserIds } from '../../../socket'
import { createPersistedCombatSession } from '../../combat/services/combatPersisted.service'
import { buildCombatStartupInputFromGameSession } from './buildGameSessionCombatStartup.server'
import { getGameSessionById, updateGameSession, type GameSessionApi } from './gameSession.service'

export type StartGameSessionResult =
  | { ok: true; session: GameSessionApi }
  | { ok: false; status: number; message: string }

/**
 * @param clientPresentUserIds - When set (from DM client), intersected with server lobby socket
 *   presence so launch uses the same user set the lobby UI shows; filters stale server-only ids.
 */
export async function startGameSession(
  gameSessionId: string,
  campaignId: string,
  userId: string,
  clientPresentUserIds?: string[],
): Promise<StartGameSessionResult> {
  const existing = await getGameSessionById(gameSessionId, campaignId)
  if (!existing) {
    return { ok: false, status: 404, message: 'Game session not found.' }
  }
  if (existing.dmUserId !== userId) {
    return { ok: false, status: 403, message: 'Only the DM can start this session.' }
  }
  if (existing.status !== 'lobby') {
    return { ok: false, status: 400, message: 'Session must be in lobby status to start.' }
  }
  if (existing.activeEncounterId) {
    return { ok: false, status: 409, message: 'Session already has an active encounter.' }
  }

  const serverPresentUserIds = getGameSessionLobbyPresentUserIds(campaignId, gameSessionId)
  const serverSet = new Set(serverPresentUserIds)
  const presentUserIds =
    clientPresentUserIds !== undefined
      ? clientPresentUserIds.filter((id) => serverSet.has(id))
      : serverPresentUserIds

  const built = await buildCombatStartupInputFromGameSession(existing, campaignId, { presentUserIds })
  if (!built.ok) {
    return { ok: false, status: 400, message: built.message }
  }

  const created = await createPersistedCombatSession(built.input)
  if (!created.ok) {
    return { ok: false, status: 400, message: created.error.message }
  }

  const updated = await updateGameSession(gameSessionId, campaignId, {
    status: 'active',
    activeEncounterId: created.sessionId,
  })
  if (!updated) {
    return { ok: false, status: 500, message: 'Failed to update game session after creating combat.' }
  }

  return { ok: true, session: updated }
}
