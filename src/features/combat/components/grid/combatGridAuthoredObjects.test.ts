import { describe, expect, it } from 'vitest'

import type { GridCellViewModel } from '@/features/mechanics/domain/combat/space/selectors/space.selectors'
import type { EncounterGridCellRenderState } from '@/features/mechanics/domain/perception/perception.render.projection'

import { filterAuthoredObjectRenderItemsForGrid } from './combatGridAuthoredObjects'

function basePerception(overrides: Partial<EncounterGridCellRenderState>): EncounterGridCellRenderState {
  return {
    occupantTokenVisibility: 'all',
    showObstacleGlyph: true,
    showAuthoredMapObjects: true,
    perceptionBaseFillKind: null,
    suppressTemplateBoundary: false,
    ...overrides,
  }
}

function cell(id: string, perception?: EncounterGridCellRenderState): GridCellViewModel {
  return { cellId: id, perception } as GridCellViewModel
}

describe('filterAuthoredObjectRenderItemsForGrid', () => {
  it('drops items whose anchor cell has showAuthoredMapObjects false', () => {
    const cells = [cell('a', basePerception({ showAuthoredMapObjects: false }))]
    const items = [
      {
        id: 'o1',
        authorCellId: 'loc-a',
        combatCellId: 'a',
        kind: 'marker' as const,
      },
    ]
    expect(filterAuthoredObjectRenderItemsForGrid(cells, items)).toEqual([])
  })

  it('keeps items when anchor cell allows authored objects', () => {
    const cells = [cell('a', basePerception({ showAuthoredMapObjects: true }))]
    const items = [
      {
        id: 'o1',
        authorCellId: 'loc-a',
        combatCellId: 'a',
        kind: 'marker' as const,
      },
    ]
    expect(filterAuthoredObjectRenderItemsForGrid(cells, items)).toEqual(items)
  })

  it('passes all items when perception is omitted (legacy / no POV)', () => {
    const cells = [cell('a', undefined)]
    const items = [
      {
        id: 'o1',
        authorCellId: 'loc-a',
        combatCellId: 'a',
        kind: 'marker' as const,
      },
    ]
    expect(filterAuthoredObjectRenderItemsForGrid(cells, items)).toEqual(items)
  })

  it('returns empty when items undefined or empty', () => {
    expect(filterAuthoredObjectRenderItemsForGrid([], undefined)).toEqual([])
    expect(filterAuthoredObjectRenderItemsForGrid([], [])).toEqual([])
  })
})
