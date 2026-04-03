import type { GridCellViewModel } from '@/features/mechanics/domain/combat/space/selectors/space.selectors'
import type { LocationMapAuthoredObjectRenderItem } from '@/shared/domain/locations/map/locationMapAuthoredObjectRender.types'

/**
 * Filters authored map object render items using per-cell perception (`showAuthoredMapObjects`).
 * When perception is omitted (legacy / no POV), all items pass through.
 */
export function filterAuthoredObjectRenderItemsForGrid(
  cells: readonly GridCellViewModel[],
  items: readonly LocationMapAuthoredObjectRenderItem[] | undefined,
): LocationMapAuthoredObjectRenderItem[] {
  if (!items?.length) return []
  const showByCombatCellId = new Map<string, boolean>()
  for (const cell of cells) {
    const show = cell.perception?.showAuthoredMapObjects ?? true
    showByCombatCellId.set(cell.cellId, show)
  }
  return items.filter((it) => showByCombatCellId.get(it.combatCellId) !== false)
}
