import {
  applyCombatIntent,
  type ApplyCombatIntentContext,
  type CombatIntent,
  type CombatIntentResult,
  type EncounterState,
} from '@rpg-world-builder/mechanics'

export type ApplyIntentBodyParseError = {
  code: 'invalid-body'
  message: string
}

/**
 * Stateless mechanics call (tests / direct use).
 */
export function applyCombatIntentRequest(
  state: EncounterState | null,
  intent: CombatIntent,
  context: ApplyCombatIntentContext,
): CombatIntentResult {
  return applyCombatIntent(state, intent, context)
}

/**
 * Persisted apply-intent body: `baseRevision` + `intent` + optional `context`.
 */
export function parsePersistedApplyIntentBody(
  body: unknown,
):
  | { ok: true; baseRevision: number; intent: CombatIntent; context: ApplyCombatIntentContext }
  | { ok: false; error: ApplyIntentBodyParseError } {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return {
      ok: false,
      error: {
        code: 'invalid-body',
        message: 'Request body must be a JSON object.',
      },
    }
  }
  const record = body as Record<string, unknown>

  if (typeof record.baseRevision !== 'number' || !Number.isInteger(record.baseRevision)) {
    return {
      ok: false,
      error: {
        code: 'invalid-body',
        message: 'Expected integer "baseRevision".',
      },
    }
  }

  if (record.intent === undefined || record.intent === null) {
    return {
      ok: false,
      error: {
        code: 'invalid-body',
        message: 'Missing property "intent".',
      },
    }
  }
  if (typeof record.intent !== 'object' || Array.isArray(record.intent)) {
    return {
      ok: false,
      error: {
        code: 'invalid-body',
        message: 'Expected "intent" to be an object.',
      },
    }
  }
  const intentRecord = record.intent as Record<string, unknown>
  if (typeof intentRecord.kind !== 'string') {
    return {
      ok: false,
      error: {
        code: 'invalid-body',
        message: 'Expected intent.kind to be a string.',
      },
    }
  }

  let context: ApplyCombatIntentContext = {}
  if (record.context !== undefined && record.context !== null) {
    if (typeof record.context !== 'object' || Array.isArray(record.context)) {
      return {
        ok: false,
        error: {
          code: 'invalid-body',
          message: 'Expected "context" to be an object.',
        },
      }
    }
    context = record.context as ApplyCombatIntentContext
  }

  return {
    ok: true,
    baseRevision: record.baseRevision,
    intent: record.intent as CombatIntent,
    context,
  }
}
