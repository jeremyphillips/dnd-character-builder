import { describe, expect, it } from 'vitest'

import type { LocationMapBase } from '@/shared/domain/locations/map/locationMap.types'

import {
  getFirstFloorLocationIdForBuilding,
  pickEncounterGridMap,
  resolveSimulatorMapHostLocationId,
} from './encounterSpaceResolution'

function mapStub(partial: Partial<LocationMapBase> & Pick<LocationMapBase, 'id' | 'kind'>): LocationMapBase {
  return {
    locationId: 'loc',
    name: 'm',
    grid: { width: 4, height: 4, cellUnit: '5ft' },
    cellEntries: [],
    pathEntries: [],
    regionEntries: [],
    ...partial,
  } as LocationMapBase
}

describe('pickEncounterGridMap', () => {
  it('returns null when no encounter-grid maps', () => {
    expect(pickEncounterGridMap([mapStub({ id: 'a', kind: 'world-grid' })])).toBeNull()
  })

  it('prefers isDefault over first list order', () => {
    const a = mapStub({ id: 'a', kind: 'encounter-grid', isDefault: false })
    const b = mapStub({ id: 'b', kind: 'encounter-grid', isDefault: true })
    expect(pickEncounterGridMap([a, b])?.id).toBe('b')
  })

  it('falls back to first encounter-grid map', () => {
    const a = mapStub({ id: 'x', kind: 'encounter-grid' })
    const b = mapStub({ id: 'y', kind: 'encounter-grid' })
    expect(pickEncounterGridMap([a, b])?.id).toBe('x')
  })
})

describe('resolveSimulatorMapHostLocationId', () => {
  it('returns first floor of selected building', () => {
    const mapHost = resolveSimulatorMapHostLocationId({
      locations: [
        { id: 'b1', scale: 'building', name: 'B', parentId: 'c' } as never,
        { id: 'f1', scale: 'floor', name: 'F1', parentId: 'b1', sortOrder: 2 } as never,
        { id: 'f0', scale: 'floor', name: 'F0', parentId: 'b1', sortOrder: 1 } as never,
      ],
      buildingLocationIds: ['b1'],
    })
    expect(mapHost).toBe('f0')
  })

  it('returns null without a building', () => {
    expect(
      resolveSimulatorMapHostLocationId({
        locations: [{ id: 'b1', scale: 'building', name: 'B' } as never],
        buildingLocationIds: [],
      }),
    ).toBeNull()
  })
})

describe('getFirstFloorLocationIdForBuilding', () => {
  it('orders floors by sortOrder then name', () => {
    const id = getFirstFloorLocationIdForBuilding('b1', [
      { id: 'z', scale: 'floor', name: 'Z', parentId: 'b1', sortOrder: 1 } as never,
      { id: 'a', scale: 'floor', name: 'A', parentId: 'b1', sortOrder: 1 } as never,
    ])
    expect(id).toBe('a')
  })
})
