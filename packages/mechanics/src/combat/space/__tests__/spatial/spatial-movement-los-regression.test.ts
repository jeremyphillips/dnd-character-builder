/**
 * Regression suite for movement vs line-of-sight spatial rules (corner routing, wall separation,
 * orthogonal decomposition for diagonals, window edges). Keep these in sync with
 * `movementReachability.ts`, `edgeCrossing.ts`, and `sight/space.sight.ts`.
 */
import { describe, expect, it } from 'vitest'

import { createSquareGridSpace } from '../../creation/createSquareGridSpace'
import { hasLineOfSight } from '../../sight/space.sight'
import {
  cellsReachableWithinMovementBudget,
  minMovementCostFtToCell,
  movementStepLegal,
} from '../../spatial/movementReachability'
import { orthogonalMovementEdgeBlocked, segmentMovementBlocked, segmentSightBlocked } from '../../spatial/edgeCrossing'

describe('regression: movement vs LoS (spatial)', () => {
  describe('movement — open corner / route around wall', () => {
    it('allows diagonal when one orthogonal edge blocks movement but the other decomposition is fully legal', () => {
      const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 6, rows: 6 })
      const eastBlocked = {
        ...space,
        edges: [{ fromCellId: 'c-0-0', toCellId: 'c-1-0', blocksMovement: true }],
      }
      expect(movementStepLegal(eastBlocked, 'c-0-0', 'c-1-1', [], 'm')).toBe(true)
      expect(minMovementCostFtToCell(eastBlocked, 'c-0-0', 'c-2-2', [], 'm')).not.toBeUndefined()
    })

    it('BFS reachability can reach past a detour (not straight supercover)', () => {
      const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 3, rows: 3 })
      const mid = space.cells.find((c) => c.x === 1 && c.y === 0)!
      const rowBlocked = {
        ...space,
        cells: space.cells.map((c) =>
          c.id === mid.id
            ? { ...c, kind: 'blocking' as const, blocksSight: true, blocksMovement: true }
            : c,
        ),
      }
      expect(minMovementCostFtToCell(rowBlocked, 'c-0-0', 'c-2-0', [], 'm')).toBe(10)
      expect(cellsReachableWithinMovementBudget(rowBlocked, 'c-0-0', 15, [], 'm').has('c-2-0')).toBe(true)
    })
  })

  describe('movement — no leak through sealed wall / invalid diagonal', () => {
    it('blocks diagonal when both orthogonal decompositions from the corner are illegal (sealed)', () => {
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

    it('blocks diagonal when each decomposition fails on a different leg (no orthogonal two-step route)', () => {
      const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 4, rows: 4 })
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
  })

  describe('movement — diagonal only with legal orthogonal decomposition', () => {
    it('requires full pathA or pathB: two consecutive legal orthogonal steps (edges + terrain)', () => {
      const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 4, rows: 4 })
      const orth1Blocking = space.cells.map((c) =>
        c.id === 'c-1-0' ? { ...c, kind: 'blocking' as const, blocksMovement: true } : c,
      )
      const withTerrain = { ...space, cells: orth1Blocking }
      // c-0-0 → c-1-1: path A uses c-1-0 (blocking terrain); path B may still work.
      expect(movementStepLegal(withTerrain, 'c-0-0', 'c-1-1', [], 'm')).toBe(true)
    })
  })

  describe('LoS — stricter geometry than movement', () => {
    it('blocks sight across an edge with blocksSight even when movement decomposition could allow a route', () => {
      const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 4, rows: 4 })
      const sightWall = {
        ...space,
        edges: [{ fromCellId: 'c-0-0', toCellId: 'c-1-0', blocksSight: true, blocksMovement: false }],
      }
      expect(segmentSightBlocked(sightWall, 'c-0-0', 'c-1-1')).toBe(true)
      expect(hasLineOfSight(sightWall, 'c-0-0', 'c-1-1')).toBe(false)
    })

    it('window: movement blocked on edge, sight not blocked by that edge', () => {
      const space = createSquareGridSpace({ id: 'g', name: 'G', columns: 4, rows: 4 })
      const windowEdge = {
        ...space,
        edges: [
          {
            fromCellId: 'c-0-0',
            toCellId: 'c-1-0',
            blocksMovement: true,
            blocksSight: false,
          },
        ],
      }
      expect(segmentSightBlocked(windowEdge, 'c-0-0', 'c-1-0')).toBe(false)
      expect(segmentMovementBlocked(windowEdge, 'c-0-0', 'c-1-0')).toBe(true)
      expect(orthogonalMovementEdgeBlocked(windowEdge, 'c-0-0', 'c-1-0')).toBe(true)
    })
  })
})
