/**
 * Select-mode fallback after object / path / edge hits: if the cell has a region assignment,
 * select that region; otherwise select the cell.
 *
 * Full priority in the grid handler remains: object → path → edge → **region** → cell
 * (path before edge is unchanged from existing geometry picking).
 */
export function resolveSelectModeRegionOrCellSelection(
  cellId: string,
  regionIdByCellId: Record<string, string | undefined>,
): { type: 'region'; regionId: string } | { type: 'cell'; cellId: string } {
  const rid = regionIdByCellId[cellId]?.trim();
  if (rid) {
    return { type: 'region', regionId: rid };
  }
  return { type: 'cell', cellId };
}
