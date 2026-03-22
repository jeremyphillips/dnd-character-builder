import type { EncounterState } from '@/features/mechanics/domain/encounter/state/types'
import type { EncounterCell, CombatantPosition, EncounterSpace } from './space.types'
import { getCellById, getCellForCombatant, getOccupant, gridDistanceFt } from './space.helpers'
import type { CombatantSide } from '@/features/mechanics/domain/encounter/state/types/combatant.types'

// ---------------------------------------------------------------------------
// State-level selectors
// ---------------------------------------------------------------------------

export function selectCombatantCell(
  state: EncounterState,
  combatantId: string,
): EncounterCell | undefined {
  if (!state.space || !state.placements) return undefined
  const cellId = getCellForCombatant(state.placements, combatantId)
  if (!cellId) return undefined
  return getCellById(state.space, cellId)
}

export function selectDistanceBetween(
  state: EncounterState,
  idA: string,
  idB: string,
): number | undefined {
  if (!state.space || !state.placements) return undefined
  const cellA = getCellForCombatant(state.placements, idA)
  const cellB = getCellForCombatant(state.placements, idB)
  if (!cellA || !cellB) return undefined
  return gridDistanceFt(state.space, cellA, cellB)
}

export function selectIsTargetInRange(
  state: EncounterState,
  actorId: string,
  targetId: string,
  rangeFt: number,
): boolean {
  const dist = selectDistanceBetween(state, actorId, targetId)
  if (dist === undefined) return true
  return dist <= rangeFt
}

// ---------------------------------------------------------------------------
// Grid view model
// ---------------------------------------------------------------------------

export type GridCellViewModel = {
  cellId: string
  x: number
  y: number
  kind: NonNullable<EncounterCell['kind']>
  occupantId: string | null
  occupantLabel: string | null
  occupantSide: CombatantSide | null
  isActive: boolean
  isSelectedTarget: boolean
  isInRange: boolean
}

export type GridViewModel = {
  columns: number
  rows: number
  cellFeet: number
  cells: GridCellViewModel[]
}

export function selectGridViewModel(
  state: EncounterState,
  opts?: {
    selectedTargetId?: string | null
    selectedActionRangeFt?: number | null
  },
): GridViewModel | undefined {
  const { space, placements } = state
  if (!space || !placements) return undefined

  const cellFeet = space.scale.kind === 'grid' ? space.scale.cellFeet : 5
  const activeId = state.activeCombatantId
  const selectedTargetId = opts?.selectedTargetId ?? null
  const rangeFt = opts?.selectedActionRangeFt ?? null

  const activeCellId = activeId ? getCellForCombatant(placements, activeId) : undefined

  const cells: GridCellViewModel[] = space.cells.map((cell) => {
    const occupantId = getOccupant(placements, cell.id) ?? null
    const combatant = occupantId ? state.combatantsById[occupantId] ?? null : null

    let inRange = false
    if (rangeFt != null && activeCellId) {
      const dist = gridDistanceFt(space, activeCellId, cell.id)
      inRange = dist !== undefined && dist <= rangeFt
    }

    return {
      cellId: cell.id,
      x: cell.x,
      y: cell.y,
      kind: cell.kind ?? 'open',
      occupantId,
      occupantLabel: combatant?.source.label ?? null,
      occupantSide: combatant?.side ?? null,
      isActive: occupantId !== null && occupantId === activeId,
      isSelectedTarget: occupantId !== null && occupantId === selectedTargetId,
      isInRange: inRange,
    }
  })

  return {
    columns: space.width,
    rows: space.height,
    cellFeet,
    cells,
  }
}

// ---------------------------------------------------------------------------
// Placement mutation
// ---------------------------------------------------------------------------

/**
 * Place or move a combatant to a specific cell. Returns a new state with updated placements.
 * Validates the cell exists and is not a wall/blocking cell.
 */
export function placeCombatant(
  state: EncounterState,
  combatantId: string,
  cellId: string,
): EncounterState {
  if (!state.space || !state.placements) return state

  const cell = getCellById(state.space, cellId)
  if (!cell) return state
  if (cell.kind === 'wall' || cell.kind === 'blocking') return state

  const filtered = state.placements.filter((p) => p.combatantId !== combatantId)
  return {
    ...state,
    placements: [...filtered, { combatantId, cellId }],
  }
}
