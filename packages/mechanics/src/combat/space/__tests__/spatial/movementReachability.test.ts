import { describe, expect, it } from 'vitest'

import { createSquareGridSpace } from '../../creation/createSquareGridSpace'
import { hasLineOfSight } from '../../sight/space.sight'
import { segmentSightBlocked } from '../../spatial/edgeCrossing'
import {
  cellsReachableWithinMovementBudget,
  minMovementCostFtToCell,
  movementStepLegal,
} from '../../spatial/movementReachability'

describe('movementReachability', () => {
  it('finds a route around a blocking cell when a straight supercover line would be blocked', () => {
    const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 3, rows: 3 })
    const mid = space.cells.find((c) => c.x === 1 && c.y === 0)!
    const withBlock = {
      ...space,
      cells: space.cells.map((c) =>
        c.id === mid.id ? { ...c, kind: 'blocking' as const, blocksSight: true, blocksMovement: true } : c,
      ),
    }
    // LoS still uses the ray through the middle cell — blocked.
    expect(hasLineOfSight(withBlock, 'c-0-0', 'c-2-0')).toBe(false)
    // Movement detours (e.g. c-0-0 → c-1-1 → c-2-0) — 2 diagonals × 5ft; not the blocked straight ray.
    expect(minMovementCostFtToCell(withBlock, 'c-0-0', 'c-2-0', [], 'mover')).toBe(10)
    expect(cellsReachableWithinMovementBudget(withBlock, 'c-0-0', 10, [], 'mover').has('c-2-0')).toBe(
      true,
    )
  })

  it('diagonal movement: allowed when at least one orthogonal decomposition (two legal orth steps) exists', () => {
    const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 4, rows: 4 })
    const oneWall = {
      ...space,
      edges: [{ fromCellId: 'c-0-0', toCellId: 'c-1-0', blocksMovement: true }],
    }
    // Path B: c-0-0 → c-0-1 → c-1-1 (east edge blocked, north-then-east still works).
    expect(movementStepLegal(oneWall, 'c-0-0', 'c-1-1', [], 'm')).toBe(true)
    expect(movementStepLegal(oneWall, 'c-0-0', 'c-0-1', [], 'm')).toBe(true)
  })

  it('diagonal movement: blocked when neither orthogonal decomposition is fully legal (sealed corner)', () => {
    const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 4, rows: 4 })
    const sealed = {
      ...space,
      edges: [
        { fromCellId: 'c-0-0', toCellId: 'c-1-0', blocksMovement: true },
        { fromCellId: 'c-0-0', toCellId: 'c-0-1', blocksMovement: true },
      ],
    }
    expect(movementStepLegal(sealed, 'c-0-0', 'c-1-1', [], 'm')).toBe(false)
  })

  it('diagonal movement: blocked when one leg of a decomposition crosses a movement-blocking edge', () => {
    const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 4, rows: 4 })
    // from c-0-0 to c-1-1: orth1=c-1-0, orth2=c-0-1. Block east from c-0-0 and north from c-1-0 (path A dead);
    // block east from c-0-1 (path B second leg c-0-1→c-1-1).
    const noRoute = {
      ...space,
      edges: [
        { fromCellId: 'c-0-0', toCellId: 'c-1-0', blocksMovement: true },
        { fromCellId: 'c-1-0', toCellId: 'c-1-1', blocksMovement: true },
        { fromCellId: 'c-0-1', toCellId: 'c-1-1', blocksMovement: true },
      ],
    }
    expect(movementStepLegal(noRoute, 'c-0-0', 'c-1-1', [], 'm')).toBe(false)
  })

  it('LoS diagonal still uses strict corner rule (either orthogonal blocks sight)', () => {
    const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 4, rows: 4 })
    const oneWall = {
      ...space,
      edges: [{ fromCellId: 'c-0-0', toCellId: 'c-1-0', blocksSight: true }],
    }
    expect(segmentSightBlocked(oneWall, 'c-0-0', 'c-1-1')).toBe(true)
  })

  it('is false when no path exists (fully enclosed)', () => {
    const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 3, rows: 3 })
    const blocked = space.cells.map((c) =>
      c.id === 'c-1-1'
        ? c
        : { ...c, kind: 'blocking' as const, blocksMovement: true },
    )
    const walled = { ...space, cells: blocked }
    expect(minMovementCostFtToCell(walled, 'c-1-1', 'c-0-0', [], 'm')).toBeUndefined()
  })
})
