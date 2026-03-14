import type { CombatLogEvent } from '../combat-log.types'
import type { EncounterState } from '../encounter.types'

function createLogId(prefix: string, count: number): string {
  return `${prefix}_${count}`
}

export function getCombatantLabel(state: EncounterState, combatantId: string | null): string {
  if (!combatantId) return 'Unknown combatant'
  return state.combatantsById[combatantId]?.source.label ?? combatantId
}

export function createEncounterStartedLog(state: EncounterState): CombatLogEvent {
  return {
    id: createLogId('encounter_started', 1),
    timestamp: new Date().toISOString(),
    type: 'encounter_started',
    round: 1,
    turn: 1,
    summary: 'Encounter started.',
    details:
      state.initiative.length > 0
        ? `Initiative order: ${state.initiative
            .map((entry) => `${entry.label} (${entry.total})`)
            .join(', ')}`
        : 'No combatants added.',
  }
}

export function createTurnStartedLog(state: EncounterState): CombatLogEvent {
  return {
    id: createLogId('turn_started', state.log.length + 1),
    timestamp: new Date().toISOString(),
    type: 'turn_started',
    actorId: state.activeCombatantId ?? undefined,
    round: state.roundNumber,
    turn: state.turnIndex + 1,
    summary: `${getCombatantLabel(state, state.activeCombatantId)} starts their turn.`,
  }
}

export function createTurnEndedLog(state: EncounterState): CombatLogEvent {
  return {
    id: createLogId('turn_ended', state.log.length + 1),
    timestamp: new Date().toISOString(),
    type: 'turn_ended',
    actorId: state.activeCombatantId ?? undefined,
    round: state.roundNumber,
    turn: state.turnIndex + 1,
    summary: `${getCombatantLabel(state, state.activeCombatantId)} ends their turn.`,
  }
}

export function createRoundStartedLog(state: EncounterState): CombatLogEvent {
  return {
    id: createLogId('round_started', state.log.length + 1),
    timestamp: new Date().toISOString(),
    type: 'round_started',
    round: state.roundNumber,
    turn: 1,
    summary: `Round ${state.roundNumber} starts.`,
  }
}

export function appendLog(
  state: EncounterState,
  event: Omit<CombatLogEvent, 'id' | 'timestamp'>,
): EncounterState {
  return {
    ...state,
    log: [
      ...state.log,
      {
        ...event,
        id: createLogId(event.type, state.log.length + 1),
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

export function appendEncounterNote(
  state: EncounterState,
  summary: string,
  options?: {
    actorId?: string
    targetIds?: string[]
    details?: string
  },
): EncounterState {
  return appendLog(state, {
    type: 'note',
    actorId: options?.actorId,
    targetIds: options?.targetIds,
    round: state.roundNumber,
    turn: state.turnIndex + 1,
    summary,
    details: options?.details,
  })
}

export function appendEncounterLogEvent(
  state: EncounterState,
  event: Omit<CombatLogEvent, 'id' | 'timestamp'>,
): EncounterState {
  return appendLog(state, event)
}

export function getEncounterCombatantLabel(state: EncounterState, combatantId: string | null): string {
  return getCombatantLabel(state, combatantId)
}

export function appendHookTriggeredLog(
  state: EncounterState,
  combatantId: string,
  hookLabel: string,
  details?: string,
): EncounterState {
  return appendLog(state, {
    type: 'hook_triggered',
    actorId: combatantId,
    targetIds: [combatantId],
    round: state.roundNumber,
    turn: state.turnIndex + 1,
    summary: `${getCombatantLabel(state, combatantId)} hook fires: ${hookLabel}.`,
    details,
  })
}
