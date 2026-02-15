import type { CharacterBuilderState } from '../types'
import type { InvalidationRule, InvalidationResult, StepInvalidation } from './types'

// ---------------------------------------------------------------------------
// Detection — run all rules against a proposed state transition
// ---------------------------------------------------------------------------

/**
 * Run every applicable rule against a prev → next state transition.
 *
 * A rule is "applicable" when at least one of its `triggers` fields has a
 * different value (shallow `!==`) between `prev` and `next`.
 *
 * Returns an `InvalidationResult` summarising what downstream data would
 * be lost.  If `hasInvalidations` is false the change is safe to apply
 * without user confirmation.
 */
export function detectInvalidations(
  rules: InvalidationRule[],
  prev: CharacterBuilderState,
  next: CharacterBuilderState
): InvalidationResult {
  const affected: StepInvalidation[] = []

  for (const rule of rules) {
    // Only run detection when a trigger field actually changed
    const triggered = rule.triggers.some(
      key => prev[key] !== next[key]
    )
    if (!triggered) continue

    const items = rule.detect(prev, next)
    if (items.length > 0) {
      affected.push({
        ruleId: rule.id,
        stepId: rule.affectedStep,
        label: rule.label,
        items,
      })
    }
  }

  return { hasInvalidations: affected.length > 0, affected }
}

// ---------------------------------------------------------------------------
// Resolution — apply all invalidations to produce a clean state
// ---------------------------------------------------------------------------

/**
 * Walk through every triggered invalidation and call the corresponding
 * rule's `resolve()` to strip invalid data from the state.
 *
 * Rules are applied in the order they appear in `result.affected`.
 * Each rule's resolver receives the state produced by the previous rule,
 * so resolutions compose cleanly.
 */
export function resolveInvalidations(
  rules: InvalidationRule[],
  state: CharacterBuilderState,
  result: InvalidationResult
): CharacterBuilderState {
  let resolved = state

  for (const inv of result.affected) {
    const rule = rules.find(r => r.id === inv.ruleId)
    if (!rule) continue
    resolved = rule.resolve(resolved, inv.items)
  }

  return resolved
}
