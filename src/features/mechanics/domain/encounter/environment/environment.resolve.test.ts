import { describe, expect, it } from 'vitest'

import { DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE, resolveCellEnvironment } from './environment.resolve'
import type { EncounterEnvironmentBaseline, EncounterEnvironmentZoneOverride } from './environment.types'

describe('resolveCellEnvironment', () => {
  it('returns baseline when no zones apply', () => {
    const r = resolveCellEnvironment(DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE, [], 'c1')
    expect(r).toEqual({
      lightingLevel: DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE.lightingLevel,
      terrainMovement: DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE.terrainMovement,
      visibilityObscured: DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE.visibilityObscured,
      atmosphereTags: DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE.atmosphereTags,
      appliedZoneIds: [],
    })
  })

  it('applies scalar overrides from last matching zone', () => {
    const baseline = {
      ...DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE,
      lightingLevel: 'bright' as const,
      visibilityObscured: 'none' as const,
    }
    const zones: EncounterEnvironmentZoneOverride[] = [
      {
        id: 'z1',
        sourceKind: 'spell',
        sourceId: 'darkness',
        area: { kind: 'grid-cell-ids', cellIds: ['a1'] },
        overrides: { visibilityObscured: 'heavy' },
      },
      {
        id: 'z2',
        sourceKind: 'spell',
        area: { kind: 'grid-cell-ids', cellIds: ['a1'] },
        overrides: { lightingLevel: 'dim' },
      },
    ]
    const r = resolveCellEnvironment(baseline, zones, 'a1')
    expect(r.visibilityObscured).toBe('heavy')
    expect(r.lightingLevel).toBe('dim')
    expect(r.appliedZoneIds).toEqual(['z1', 'z2'])
  })

  it('merges atmosphere tags with replace/remove/add ordering per zone', () => {
    const baseline: EncounterEnvironmentBaseline = {
      ...DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE,
      atmosphereTags: ['high-wind'],
    }
    const zones: EncounterEnvironmentZoneOverride[] = [
      {
        id: 'z1',
        sourceKind: 'manual',
        area: { kind: 'grid-cell-ids', cellIds: ['x'] },
        overrides: {
          atmosphereTagsReplace: ['underwater'],
        },
      },
      {
        id: 'z2',
        sourceKind: 'manual',
        area: { kind: 'grid-cell-ids', cellIds: ['x'] },
        overrides: {
          atmosphereTagsAdd: ['extreme-cold'],
        },
      },
    ]
    const r = resolveCellEnvironment(baseline, zones, 'x')
    expect(new Set(r.atmosphereTags)).toEqual(new Set(['underwater', 'extreme-cold']))
  })
})
