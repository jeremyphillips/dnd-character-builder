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
 * Stateless smoke body: canonical `state` + `intent` + optional `context`.
 * `context` matches {@link ApplyCombatIntentContext} (JSON-serializable options only).
 */
export function parseApplyIntentBody(
  body: unknown,
):
  | { ok: true; state: EncounterState | null; intent: CombatIntent; context: ApplyCombatIntentContext }
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

  if (record.state !== undefined && record.state !== null) {
    if (typeof record.state !== 'object' || Array.isArray(record.state)) {
      return {
        ok: false,
        error: {
          code: 'invalid-body',
          message: 'Expected "state" to be an object or null.',
        },
      }
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

  const state: EncounterState | null =
    record.state === undefined || record.state === null
      ? null
      : (record.state as EncounterState)

  return {
    ok: true,
    state,
    intent: record.intent as CombatIntent,
    context,
  }
}

export function applyCombatIntentRequest(
  state: EncounterState | null,
  intent: CombatIntent,
  context: ApplyCombatIntentContext,
): CombatIntentResult {
  return applyCombatIntent(state, intent, context)
}
