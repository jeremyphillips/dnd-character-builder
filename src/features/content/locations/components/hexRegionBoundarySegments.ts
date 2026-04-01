import { makeGridCellId, parseGridCellId } from '@/shared/domain/grid/gridCellIds';

/** Odd-q neighbor offsets; must match {@link shared/domain/grid/gridHelpers} hex tables. */
const HEX_NEIGHBORS_EVEN_COL: readonly [number, number][] = [
  [+1, -1],
  [+1, 0],
  [0, +1],
  [-1, 0],
  [-1, -1],
  [0, -1],
];

const HEX_NEIGHBORS_ODD_COL: readonly [number, number][] = [
  [+1, 0],
  [+1, +1],
  [0, +1],
  [-1, +1],
  [-1, 0],
  [0, -1],
];

const SQRT3_OVER_2 = Math.sqrt(3) / 2;

const COORD_EPS = 1e-3;

function near(a: number, b: number): boolean {
  return Math.abs(a - b) < COORD_EPS;
}

/**
 * Top-left of the hex bounding box in pixel space (matches {@link HexGridEditor} layout).
 */
export function hexCellTopLeftPx(
  col: number,
  row: number,
  hexW: number,
  hexH: number,
): { px: number; py: number } {
  const colStep = hexW * 0.75;
  const rowStep = hexH;
  /** Odd column for odd-q layout; `col % 2 === 1` is wrong when col is negative (e.g. -1 % 2 === -1). */
  const isOddCol = ((col % 2) + 2) % 2 === 1;
  const px = col * colStep;
  const py = row * rowStep + (isOddCol ? hexH * 0.5 : 0);
  return { px, py };
}

/**
 * Vertices of a flat-top hex in pixel space, counter-clockwise from top-left.
 * Matches CSS `polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)`.
 */
export function hexVerticesFromTopLeft(
  px: number,
  py: number,
  hexW: number,
  hexH: number,
): { x: number; y: number }[] {
  return [
    { x: px + 0.25 * hexW, y: py },
    { x: px + 0.75 * hexW, y: py },
    { x: px + hexW, y: py + 0.5 * hexH },
    { x: px + 0.75 * hexW, y: py + hexH },
    { x: px + 0.25 * hexW, y: py + hexH },
    { x: px, y: py + 0.5 * hexH },
  ];
}

/**
 * The shared edge segment between two adjacent hex cells (including when the neighbor
 * is out of grid bounds — geometry still lines up).
 */
export function sharedEdgeBetweenHexCells(
  ax: number,
  ay: number,
  nx: number,
  ny: number,
  hexW: number,
  hexH: number,
): { x1: number; y1: number; x2: number; y2: number } | null {
  const p = hexCellTopLeftPx(ax, ay, hexW, hexH);
  const q = hexCellTopLeftPx(nx, ny, hexW, hexH);
  const va = hexVerticesFromTopLeft(p.px, p.py, hexW, hexH);
  const vb = hexVerticesFromTopLeft(q.px, q.py, hexW, hexH);
  for (let i = 0; i < 6; i++) {
    const a0 = va[i];
    const a1 = va[(i + 1) % 6];
    for (let j = 0; j < 6; j++) {
      const b0 = vb[j];
      const b1 = vb[(j + 1) % 6];
      if (near(a0.x, b0.x) && near(a0.y, b0.y) && near(a1.x, b1.x) && near(a1.y, b1.y)) {
        return { x1: a0.x, y1: a0.y, x2: a1.x, y2: a1.y };
      }
      if (near(a0.x, b1.x) && near(a0.y, b1.y) && near(a1.x, b0.x) && near(a1.y, b0.y)) {
        return { x1: a0.x, y1: a0.y, x2: a1.x, y2: a1.y };
      }
    }
  }
  return null;
}

export type HexBoundarySegment = { x1: number; y1: number; x2: number; y2: number };

/**
 * Exposed boundary edges of a region on a hex map: for each cell in `regionCellIds`,
 * each side whose neighbor is not in the same region (or is out of bounds) becomes one segment.
 */
export function hexExposedRegionBoundarySegments(
  columns: number,
  rows: number,
  regionCellIds: ReadonlySet<string>,
  hexSize: number,
): HexBoundarySegment[] {
  if (columns <= 0 || rows <= 0 || regionCellIds.size === 0 || hexSize <= 0) {
    return [];
  }
  const hexW = hexSize;
  const hexH = hexSize * SQRT3_OVER_2;
  const segs: HexBoundarySegment[] = [];

  for (const cellId of regionCellIds) {
    const p = parseGridCellId(cellId);
    if (!p) continue;
    const { x, y } = p;
    if (x < 0 || y < 0 || x >= columns || y >= rows) continue;

    const offsets = x % 2 === 0 ? HEX_NEIGHBORS_EVEN_COL : HEX_NEIGHBORS_ODD_COL;
    for (let dir = 0; dir < 6; dir++) {
      const [dx, dy] = offsets[dir];
      const nx = x + dx;
      const ny = y + dy;
      const nId = makeGridCellId(nx, ny);
      const neighborInRegion =
        nx >= 0 &&
        nx < columns &&
        ny >= 0 &&
        ny < rows &&
        regionCellIds.has(nId);
      if (neighborInRegion) continue;

      const seg = sharedEdgeBetweenHexCells(x, y, nx, ny, hexW, hexH);
      if (seg) segs.push(seg);
    }
  }

  return segs;
}
