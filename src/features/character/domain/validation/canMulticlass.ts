import type { MulticlassingRules } from '@/data/ruleSets';
import { resolveRule, type RuleResolveContext } from '@/features/mechanics/domain/core/rules';

export interface CanMulticlassResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Determines whether a character can add another class.
 *
 * Resolves the multiclassing RuleConfig against the given context so
 * per-class / per-race overrides take effect automatically.
 */
export const canAddClass = (
  multiclassingConfig: MulticlassingRules,
  context: RuleResolveContext,
  currentClasses: number,
  remainingLevels: number,
  characterLevel: number,
): CanMulticlassResult => {
  const rules = resolveRule(multiclassingConfig, context);

  if (!rules.enabled) {
    return { allowed: false, reason: 'Campaign does not support multiclassing' };
  }

  if (rules.minLevelToMulticlass != null && characterLevel < rules.minLevelToMulticlass) {
    return {
      allowed: false,
      reason: `Requires level ${rules.minLevelToMulticlass} to multiclass`,
    };
  }

  if (rules.maxClasses != null && currentClasses >= rules.maxClasses) {
    return {
      allowed: false,
      reason: `Campaign allows a maximum of ${rules.maxClasses} classes`,
    };
  }

  if (remainingLevels <= 0) {
    return { allowed: false, reason: 'No remaining levels to allocate' };
  }

  return { allowed: true };
};
