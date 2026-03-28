import { describe, expect, it } from 'vitest'

import { getCombatantHideEligibilityExtensionOptions } from '@/features/mechanics/domain/encounter/state/combatant-hide-eligibility'

import { testEnemy } from './encounter-visibility-test-fixtures'

describe('getCombatantHideEligibilityExtensionOptions', () => {
  it('returns undefined when no hide eligibility flags are set', () => {
    const c = testEnemy('o', 'Orc', 20)
    expect(getCombatantHideEligibilityExtensionOptions(c)).toBeUndefined()
  })

  it('returns extension options from skillRuntime.hideEligibilityFeatureFlags', () => {
    const c = testEnemy('o', 'Orc', 20)
    const withFlags = {
      ...c,
      stats: {
        ...c.stats,
        skillRuntime: { hideEligibilityFeatureFlags: { allowHalfCoverForHide: true } },
      },
    }
    expect(getCombatantHideEligibilityExtensionOptions(withFlags)).toEqual({
      featureFlags: { allowHalfCoverForHide: true },
    })
  })
})
