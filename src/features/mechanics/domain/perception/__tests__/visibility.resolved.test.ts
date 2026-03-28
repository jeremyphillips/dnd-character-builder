import { describe, expect, it } from 'vitest'

import type { EncounterWorldCellEnvironment } from '../../environment/environment.types'
import { buildVisibilityContributors } from '../visibility.contributors'
import { pickPrimaryObscurationCause, resolveCellVisibility } from '../visibility.resolved'
import type { EncounterViewerPerceptionCell } from '../perception.types'

function world(partial: Partial<EncounterWorldCellEnvironment>): EncounterWorldCellEnvironment {
  return {
    setting: 'outdoors',
    lightingLevel: 'bright',
    terrainMovement: 'normal',
    visibilityObscured: 'none',
    atmosphereTags: [],
    magicalDarkness: false,
    blocksDarkvision: false,
    magical: false,
    terrainCover: 'none',
    appliedZoneIds: [],
    obscurationPresentationCauses: [],
    ...partial,
  }
}

function perception(partial: Partial<EncounterViewerPerceptionCell> = {}): EncounterViewerPerceptionCell {
  return {
    canPerceiveCell: true,
    canPerceiveOccupants: true,
    canPerceiveObjects: true,
    maskedByDarkness: false,
    maskedByMagicalDarkness: false,
    suppressTemplateBoundary: false,
    worldLightingLevel: 'bright',
    worldVisibilityObscured: 'none',
    appliedZoneIds: [],
    ...partial,
  }
}

describe('pickPrimaryObscurationCause', () => {
  it('prefers magical darkness over darkness, fog, and environment', () => {
    expect(pickPrimaryObscurationCause(['environment', 'fog', 'darkness', 'magical-darkness'])).toBe(
      'magical-darkness',
    )
  })

  it('prefers darkness over fog and environment', () => {
    expect(pickPrimaryObscurationCause(['environment', 'fog', 'darkness'])).toBe('darkness')
  })

  it('prefers fog over environment', () => {
    expect(pickPrimaryObscurationCause(['environment', 'fog'])).toBe('fog')
  })

  it('returns undefined for empty causes', () => {
    expect(pickPrimaryObscurationCause([])).toBeUndefined()
  })
})

describe('resolveCellVisibility', () => {
  it('marks hidden and unrevealed when perception cannot perceive cell', () => {
    const w = world({ lightingLevel: 'bright', visibilityObscured: 'none' })
    const contributors = buildVisibilityContributors({
      targetWorld: w,
      perception: perception({ canPerceiveCell: false }),
    })
    const r = resolveCellVisibility({ world: w, contributors })
    expect(r.hidden).toBe(true)
    expect(r.primaryCause).toBe('unrevealed')
    expect(r.lighting).toBe('bright')
  })

  it('prefers magical darkness over fog when both appear in world causes', () => {
    const w = world({
      visibilityObscured: 'heavy',
      obscurationPresentationCauses: ['fog', 'magical-darkness'],
    })
    const contributors = buildVisibilityContributors({ targetWorld: w, perception: perception() })
    const r = resolveCellVisibility({ world: w, contributors })
    expect(r.hidden).toBe(false)
    expect(r.primaryCause).toBe('magical-darkness')
    expect(r.obscured).toBe('heavy')
  })

  it('hidden contributor wins over fog causes', () => {
    const w = world({
      visibilityObscured: 'heavy',
      obscurationPresentationCauses: ['fog'],
    })
    const contributors = buildVisibilityContributors({
      targetWorld: w,
      perception: perception({ canPerceiveCell: false }),
    })
    const r = resolveCellVisibility({ world: w, contributors })
    expect(r.hidden).toBe(true)
    expect(r.primaryCause).toBe('unrevealed')
  })
})
