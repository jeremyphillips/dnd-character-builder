import type { InitiativeRoll } from '../../resolution'
import type { CombatantInstance } from './combatant.types'
import type { CombatLogEvent } from './combat-log.types'
import type { EncounterSpace, CombatantPosition } from '@/features/encounter/space'

/** Runtime attached battlefield aura (e.g. Spirit Guardians emanation). */
export type AttachedAuraInstance = {
  id: string
  sourceCombatantId: string
  spellId: string
  attachedTo: 'self'
  area: { kind: 'sphere'; size: number }
  unaffectedCombatantIds: string[]
  /** Caster's spell save DC at cast time; used for interval payloads (e.g. end-of-turn saves). */
  spellSaveDc?: number
}

export interface EncounterState {
  combatantsById: Record<string, CombatantInstance>
  partyCombatantIds: string[]
  enemyCombatantIds: string[]
  initiative: InitiativeRoll[]
  initiativeOrder: string[]
  activeCombatantId: string | null
  turnIndex: number
  roundNumber: number
  started: boolean
  log: CombatLogEvent[]
  space?: EncounterSpace
  placements?: CombatantPosition[]
  /** Persistent self-centered effects tied to a combatant (e.g. Spirit Guardians). */
  attachedAuraInstances?: AttachedAuraInstance[]
}
