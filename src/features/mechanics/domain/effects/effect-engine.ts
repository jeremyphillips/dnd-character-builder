import type { Condition } from "../conditions/condition.types";
//import { EvaluationContext } from "./evaluation-context.types";

export function evaluateCondition(
  condition: Condition,
  context: EvaluationContext
): boolean => {

  switch (condition.kind) {
    case 'and':
      return condition.conditions.every(evaluateCondition)
    case 'or':
      return condition.conditions.some(evaluateCondition)
    case 'not':
      return !evaluateCondition(condition.condition)
  }
} 
