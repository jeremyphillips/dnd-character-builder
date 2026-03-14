import type { CombatLogEvent } from './combat-log.types'
import type { CombatantInstance } from './combatant.types'
import { rollInitiative, type InitiativeResolverOptions } from './initiative-resolver'
import type { EncounterState } from './encounter.types'

function indexCombatants(combatants: CombatantInstance[]): Record<string, CombatantInstance> {
  return Object.fromEntries(combatants.map((combatant) => [combatant.instanceId, combatant]))
}

function createEncounterStartedLog(initiativeOrder: string[]): CombatLogEvent {
  return {
    id: 'encounter_started',
    timestamp: new Date().toISOString(),
    type: 'encounter_started',
    round: 1,
    turn: 1,
    summary: 'Encounter started.',
    details: initiativeOrder.length > 0 ? `Initiative order: ${initiativeOrder.join(', ')}` : 'No combatants added.',
  }
}

export function createEncounterState(
  combatants: CombatantInstance[],
  options: InitiativeResolverOptions = {},
): EncounterState {
  const initiative = rollInitiative(
    combatants.map((combatant) => ({
      instanceId: combatant.instanceId,
      label: combatant.source.label,
      initiativeModifier: combatant.stats.initiativeModifier,
      dexterityScore: combatant.stats.dexterityScore,
    })),
    options,
  )

  const initiativeOrder = initiative.map((entry) => entry.combatantId)
  const partyCombatantIds = combatants
    .filter((combatant) => combatant.side === 'party')
    .map((combatant) => combatant.instanceId)
  const enemyCombatantIds = combatants
    .filter((combatant) => combatant.side === 'enemies')
    .map((combatant) => combatant.instanceId)

  return {
    combatantsById: indexCombatants(combatants),
    partyCombatantIds,
    enemyCombatantIds,
    initiative,
    initiativeOrder,
    activeCombatantId: initiativeOrder[0] ?? null,
    turnIndex: 0,
    roundNumber: 1,
    started: true,
    log: [createEncounterStartedLog(initiativeOrder)],
  }
}
