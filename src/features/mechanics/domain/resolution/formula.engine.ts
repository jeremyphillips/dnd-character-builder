import type { StatTarget } from "./stat-resolver"
import type { Condition } from "../conditions/condition.types"
import type { AbilityScores } from "@/shared/types/character.core"
import type { EvaluationContext } from "../conditions/evaluation-context.types"
import { getAbilityModifier } from "../core"

// Responsible for:
//   - Evaluating formula definitions
//   - Returning candidate values
//   - Choosing which formula wins

// It does not know about:
//   - Modifiers
//   - Stacking
//   - Combat
//   - Features

export type FormulaDefinition = {
  base?: number
  ability?: keyof AbilityScores
  abilities?: AbilityScores[]
  proficiency?: boolean
  perLevel?: number
}

export type FormulaEffect = {
  kind: 'formula'
  target: StatTarget
  formula: FormulaDefinition
  condition?: Condition
  priority?: number
}

export function resolveFormulaValue(
  effect: FormulaEffect,
  context: EvaluationContext
): number {
  const { formula } = effect
  let value = 0

  if (formula.base !== undefined) {
    value += formula.base
  }

  if (formula.ability) {
    value += getAbilityModifier(context.self, formula.ability)
  }

  if (formula.abilities) {
    value += formula.abilities.reduce(
      (sum, ability) =>
        sum + getAbilityModifier(context.self, ability),
      0
    )
  }

  if (formula.proficiency) {
    value += getProficiencyBonus(context.self.level)
  }

  if (formula.perLevel) {
    value += context.self.level * formula.perLevel
  }

  return value
}
