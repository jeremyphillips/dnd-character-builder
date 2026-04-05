import { makeGridCellId, parseGridCellId } from '@/shared/domain/grid/gridCellIds';

const SQRT3_OVER_2 = Math.sqrt(3) / 2;

/**
 * Pixel center of a hex cell in the odd-q offset layout.
 * Mirrors HexGridEditor positioning: flat-top hex, odd columns shifted down.
 */
export function hexCellCenterPx(
  cellId: string,
  hexSize: number,
): { cx: number; cy: number } | null {
  const p = parseGridCellId(cellId);
  if (!p) return null;
  const hexW = hexSize;
  const hexH = hexSize * SQRT3_OVER_2;
  const colStep = hexW * 0.75;
  const rowStep = hexH;
  const isOddCol = p.x % 2 === 1;
  const px = p.x * colStep;
  const py = p.y * rowStep + (isOddCol ? hexH * 0.5 : 0);
  return { cx: px + hexW / 2, cy: py + hexH / 2 };
}

/**
 * SVG overlay container dimensions matching HexGridEditor layout.
 */
export function hexOverlayDimensions(
  cols: number,
  rows: number,
  hexSize: number,
): { width: number; height: number } {
  const hexW = hexSize;
  const hexH = hexSize * SQRT3_OVER_2;
  const colStep = hexW * 0.75;
  const rowStep = hexH;
  const width = cols > 0 ? colStep * (cols - 1) + hexW : 0;
  const height = rows > 0 ? rowStep * (rows - 1) + hexH + rowStep * 0.5 : 0;
  return { width, height };
}

/**
 * Resolve the nearest hex cell from a pixel position within the grid container.
 * Returns the cellId of the closest hex center, or null if out of bounds.
 */
export function resolveNearestHexCell(
  gx: number,
  gy: number,
  cols: number,
  rows: number,
  hexSize: number,
): string | null {
  if (cols <= 0 || rows <= 0 || hexSize <= 0) return null;
  const hexW = hexSize;
  const hexH = hexSize * SQRT3_OVER_2;
  const colStep = hexW * 0.75;
  const rowStep = hexH;

  let bestDist = Infinity;
  let bestId: string | null = null;

  const approxCol = Math.round(gx / colStep);
  const colMin = Math.max(0, approxCol - 1);
  const colMax = Math.min(cols - 1, approxCol + 1);

  for (let x = colMin; x <= colMax; x++) {
    const isOdd = x % 2 === 1;
    const yOffset = isOdd ? hexH * 0.5 : 0;
    const approxRow = Math.round((gy - yOffset - hexH / 2) / rowStep);
    const rowMin = Math.max(0, approxRow - 1);
    const rowMax = Math.min(rows - 1, approxRow + 1);

    for (let y = rowMin; y <= rowMax; y++) {
      const cx = x * colStep + hexW / 2;
      const cy = y * rowStep + yOffset + hexH / 2;
      const dist = (gx - cx) ** 2 + (gy - cy) ** 2;
      if (dist < bestDist) {
        bestDist = dist;
        bestId = makeGridCellId(x, y);
      }
    }
  }

  return bestId;
}
