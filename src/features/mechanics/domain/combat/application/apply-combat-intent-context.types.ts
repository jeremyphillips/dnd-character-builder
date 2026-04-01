import type { AdvanceEncounterTurnOptions } from '../state/runtime'
import type { ResolveCombatActionOptions } from '../resolution/action-resolution.types'

/**
 * Dependencies for applying intents locally. Same shape can later be satisfied by a server round-trip
 * (serialized intents + server-provided options).
 */
export type ApplyCombatIntentContext = {
  /** Passed to {@link advanceEncounterTurn} for `end-turn` intents. */
  advanceEncounterTurnOptions?: AdvanceEncounterTurnOptions
  /** Passed to {@link resolveCombatAction} when `resolve-action` is implemented. */
  resolveCombatActionOptions?: ResolveCombatActionOptions
}
