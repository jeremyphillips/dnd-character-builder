/**
 * @deprecated Import from '@/features/mechanics/domain/character-build/invalidation' instead.
 *
 * This barrel re-exports the engine-owned invalidation API for backward
 * compatibility.  New code should import directly from the engine module.
 */
export type {
  InvalidationItem,
  InvalidationItemKind,
  InvalidationRule,
  StepInvalidation,
  InvalidationResult,
  Trigger,
} from '@/features/mechanics/domain/character-build/invalidation'

export {
  detectInvalidations,
  resolveInvalidations,
  INVALIDATION_RULES,
} from '@/features/mechanics/domain/character-build/invalidation'
