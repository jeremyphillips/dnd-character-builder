import type { Effect } from '@/features/mechanics/domain/effects/effects.types'
import type { AbilityId } from '@/features/mechanics/domain/core/character/abilities.types'
import type { BreakdownToken } from '../resolution/stat-resolver'

export type CombatActionKind =
  | 'weapon_attack'
  | 'monster_action'
  | 'spell'
  | 'combat_effect'

export type CombatActionResolutionMode = 'attack_roll' | 'saving_throw' | 'log_only'

export interface CombatActionCost {
  action?: boolean
  bonusAction?: boolean
  reaction?: boolean
  movementFeet?: number
}

export interface CombatActionAttackProfile {
  attackBonus: number
  attackBreakdown?: BreakdownToken[]
  damage?: string
  damageType?: string
  damageBreakdown?: BreakdownToken[]
}

export interface CombatActionSequenceStep {
  actionLabel: string
  count: number
  countFromTrackedPart?: 'head' | 'limb'
}

export interface CombatActionSaveProfile {
  ability: AbilityId
  dc: number
  halfDamageOnSave?: boolean
}

export interface CombatActionTargetingProfile {
  kind: 'single_target' | 'all_enemies' | 'entered_during_move'
}

export interface CombatActionUsage {
  recharge?: {
    min: number
    max: number
    ready: boolean
  }
  uses?: {
    max: number
    remaining: number
    period: 'day'
  }
}

export interface CombatActionDefinition {
  id: string
  label: string
  kind: CombatActionKind
  cost: CombatActionCost
  resolutionMode: CombatActionResolutionMode
  attackProfile?: CombatActionAttackProfile
  damage?: string
  damageType?: string
  saveProfile?: CombatActionSaveProfile
  targeting?: CombatActionTargetingProfile
  usage?: CombatActionUsage
  onHitEffects?: Effect[]
  onFailEffects?: Effect[]
  onSuccessEffects?: Effect[]
  sequence?: CombatActionSequenceStep[]
  logText?: string
}
