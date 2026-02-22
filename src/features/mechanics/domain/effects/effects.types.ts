import type { AbilityScores } from '@/shared/types/character.core'
import type { Condition } from '../conditions/condition.types'
import type { TriggerType } from './trigger.types'

export type Duration = '1 minute' | '1 hour' | '1 day' | '1 week' | '1 month' | '1 year' | 'instant'

export type FormulaDefinition = {}

export type ScalingRule = {}

export type ResourceCost = {
  resource: string
  amount: number
}

export type ModifierEffect = {
  kind: 'modifier'
  target: keyof AbilityScores
  mode: 'add' | 'set' | 'multiply'
  value: number | { ability: keyof AbilityScores }
  condition?: Condition
  duration?: Duration
}

export type FormulaEffect = {
  kind: 'formula'
  target: 'armor_class' | 'initiative' // TODO: add more
  formula: FormulaDefinition
  condition?: Condition
}

export type GrantEffect = {
  kind: 'grant'
  grantType: 'proficiency' | 'action' | 'spell' | 'condition_immunity'
  value: unknown
}


export type ResourceEffect = {
  kind: 'resource'
  resource: {
    id: string
    max: number | ScalingRule
    recharge: 'short_rest' | 'long_rest' | 'none'
    dice?: string
  }
}

export type TriggeredEffect = {
  kind: 'trigger'
  trigger: TriggerType
  effects: Effect[]
  cost?: ResourceCost
}

export type AuraEffect = {
  kind: 'aura'
  range: number
  affects: 'allies' | 'enemies' | 'self'
  effects: Effect[]
}

export type Effect =
  | ModifierEffect
  | FormulaEffect
  | GrantEffect
  | ResourceEffect
  | TriggeredEffect
  | AuraEffect
