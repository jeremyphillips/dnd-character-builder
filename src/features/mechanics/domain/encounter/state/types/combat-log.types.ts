export type CombatLogEventType =
  | 'encounter_started'
  | 'turn_started'
  | 'turn_ended'
  | 'round_started'
  | 'action_declared'
  | 'action_resolved'
  | 'attack_hit'
  | 'attack_missed'
  | 'spell_logged'
  | 'hook_triggered'
  | 'effect_expired'
  | 'damage_applied'
  | 'healing_applied'
  | 'condition_applied'
  | 'condition_removed'
  | 'state_applied'
  | 'state_removed'
  | 'note'

export interface CombatLogEvent {
  id: string
  timestamp: string
  type: CombatLogEventType
  actorId?: string
  targetIds?: string[]
  round: number
  turn: number
  summary: string
  details?: string
}
