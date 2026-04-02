import { ApiError, apiFetch } from '@/app/api'
import type { ApplyCombatIntentContext } from '@/features/mechanics/domain/combat'
import type { CombatIntent } from '@/features/mechanics/domain/combat'
import type { EncounterState } from '@/features/mechanics/domain/combat'

/** Drops catalog blobs from context for HTTP — not JSON-serializable functions are already absent; monstersById is huge. */
function slimPersistedCombatIntentContext(context: ApplyCombatIntentContext): ApplyCombatIntentContext {
  const out: ApplyCombatIntentContext = { ...context }

  if (context.resolveCombatActionOptions?.monstersById) {
    const { monstersById: _m, ...rest } = context.resolveCombatActionOptions
    out.resolveCombatActionOptions = rest
  }

  if (context.advanceEncounterTurnOptions?.battlefieldInterval?.monstersById) {
    const { monstersById: _m, ...bfInterval } = context.advanceEncounterTurnOptions.battlefieldInterval
    out.advanceEncounterTurnOptions = {
      ...context.advanceEncounterTurnOptions,
      battlefieldInterval: bfInterval,
    }
  }

  if (context.moveCombatantSpellContext?.monstersById) {
    const { monstersById: _m, ...rest } = context.moveCombatantSpellContext
    out.moveCombatantSpellContext = rest
  }

  if (context.spatialEntryAfterMove?.monstersById) {
    const { monstersById: _m, ...rest } = context.spatialEntryAfterMove
    out.spatialEntryAfterMove = rest
  }

  return out
}

export type PersistedCombatSessionDto = {
  sessionId: string
  revision: number
  state: EncounterState
}

export async function fetchPersistedCombatSession(sessionId: string): Promise<PersistedCombatSessionDto> {
  const data = await apiFetch<{
    ok: true
    sessionId: string
    revision: number
    state: EncounterState
  }>(`/api/combat/sessions/${encodeURIComponent(sessionId)}`)
  return { sessionId: data.sessionId, revision: data.revision, state: data.state }
}

export type PostCombatIntentResult =
  | {
      ok: true
      revision: number
      state: EncounterState
    }
  | {
      ok: false
      kind: 'not-found' | 'stale' | 'mechanics-rejected'
      currentRevision?: number
    }

export async function postPersistedCombatIntent(args: {
  sessionId: string
  baseRevision: number
  intent: CombatIntent
  context?: ApplyCombatIntentContext
}): Promise<PostCombatIntentResult> {
  const { sessionId, baseRevision, intent, context = {} } = args
  const slimContext = slimPersistedCombatIntentContext(context)
  try {
    const data = await apiFetch<{
      ok: true
      revision: number
      state?: EncounterState
      result?: unknown
    }>(`/api/combat/sessions/${encodeURIComponent(sessionId)}/intents`, {
      method: 'POST',
      body: { baseRevision, intent, context: slimContext },
    })

    if (data.state != null && typeof data.revision === 'number') {
      return { ok: true, revision: data.revision, state: data.state }
    }
    return { ok: false, kind: 'mechanics-rejected' }
  } catch (e) {
    if (e instanceof ApiError) {
      const payload = e.payload as { error?: { code?: string; currentRevision?: number } } | null
      const code = payload?.error?.code
      if (code === 'session-not-found' || e.status === 404) return { ok: false, kind: 'not-found' }
      if (code === 'stale-revision' || e.status === 409) {
        return { ok: false, kind: 'stale', currentRevision: payload?.error?.currentRevision }
      }
    }
    throw e
  }
}
