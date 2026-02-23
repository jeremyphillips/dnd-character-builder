/**
 * @deprecated Use types from '@/features/mechanics/domain/character-build/invalidation' instead.
 *
 * These types are the legacy string-based API; the engine now uses
 * `InvalidationItem` (id + kind + label) and `Trigger` (key | fn).
 * Kept only for reference — no code should import these anymore.
 */
import type { CharacterBuilderState, StepId } from '../types'

export interface InvalidationRule {
  /** Unique identifier for this rule (e.g. "level→spells"). */
  id: string

  /**
   * State field(s) whose change triggers this rule.
   * The engine only runs `detect` when at least one trigger field differs
   * between prev and next state (shallow !== comparison).
   */
  triggers: (keyof CharacterBuilderState)[]

  /** The builder step that owns the affected data (used for grouping notices). */
  affectedStep: StepId

  /** Human-readable label for the affected data category (e.g. "Spells"). */
  label: string

  /**
   * Given the previous and proposed-next state, return the names of items
   * that would become invalid.  An empty array means nothing to invalidate.
   *
   * The names are user-facing strings (e.g. spell names, weapon names) that
   * appear in the confirmation dialog and step notices.
   */
  detect: (prev: CharacterBuilderState, next: CharacterBuilderState) => string[]

  /**
   * Produce a cleaned version of `state` with the invalidated data removed.
   * Called only after the user confirms the change.
   *
   * `invalidated` is the same array returned by `detect`.
   */
  resolve: (state: CharacterBuilderState, invalidated: string[]) => CharacterBuilderState
}

// ---------------------------------------------------------------------------
// Results returned by the validation engine
// ---------------------------------------------------------------------------

/** One group of invalidated items, tied to a specific step. */
export interface StepInvalidation {
  /** The rule that produced this invalidation. */
  ruleId: string
  /** The step whose data is affected. */
  stepId: StepId
  /** Human-readable category (mirrors InvalidationRule.label). */
  label: string
  /** User-facing names of the items that will be lost. */
  items: string[]
}

/** Aggregate result of running all rules against a proposed state change. */
export interface InvalidationResult {
  /** True if at least one rule detected invalidations. */
  hasInvalidations: boolean
  /** Per-step breakdown of affected data. */
  affected: StepInvalidation[]
}
