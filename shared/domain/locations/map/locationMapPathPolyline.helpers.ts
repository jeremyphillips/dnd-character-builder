import type { LocationMapPathAuthoringEntry } from './locationMap.types';
import type { PathCenterlinePoint } from './locationMapPathCenterline.helpers';
import { pathEntryToCenterlinePoints } from './locationMapPathCenterline.helpers';
import type { PathPolylineGeometry } from './locationMapGeometry.types';

function centerlineToPoint2D(p: PathCenterlinePoint): { x: number; y: number } {
  return { x: p.cx, y: p.cy };
}

/**
 * One path entry → polyline in pixel space, composing {@link pathEntryToCenterlinePoints}.
 * Returns null if fewer than two resolved centers.
 */
export function pathEntryToPolylineGeometry(
  entry: LocationMapPathAuthoringEntry,
  centerFn: (cellId: string) => PathCenterlinePoint | null,
): PathPolylineGeometry | null {
  const centers = pathEntryToCenterlinePoints(entry, centerFn);
  if (centers.length < 2) return null;
  return {
    id: entry.id,
    kind: entry.kind,
    points: centers.map(centerlineToPoint2D),
  };
}

/**
 * All path entries → polylines. Each entry uses the same authored→centerline seam as
 * {@link pathEntryToCenterlinePoints} (via {@link pathEntryToPolylineGeometry}).
 */
export function pathEntriesToPolylineGeometry(
  pathEntries: readonly LocationMapPathAuthoringEntry[],
  centerFn: (cellId: string) => PathCenterlinePoint | null,
): PathPolylineGeometry[] {
  const out: PathPolylineGeometry[] = [];
  for (const entry of pathEntries) {
    const g = pathEntryToPolylineGeometry(entry, centerFn);
    if (g) out.push(g);
  }
  return out;
}
