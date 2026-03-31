import type { LocationMapPathSegment } from '@/shared/domain/locations/map/locationMap.types';
import type { LocationMapPathFeatureKindId } from '@/shared/domain/locations/map/locationMapPathFeature.constants';

type Point = { cx: number; cy: number };
type CenterFn = (cellId: string) => Point | null;

/**
 * Build maximal ordered chains of cell IDs from a set of path segments.
 * Segments are grouped by kind; within each kind an adjacency graph is built
 * and chains are extracted by walking from endpoints (degree-1 nodes) or
 * from arbitrary nodes for cycles.
 */
export function buildPathChains(
  segments: readonly LocationMapPathSegment[],
  kindFilter?: LocationMapPathFeatureKindId,
): { kind: LocationMapPathFeatureKindId; cells: string[] }[] {
  const filtered = kindFilter
    ? segments.filter((s) => s.kind === kindFilter)
    : segments;

  const byKind = new Map<LocationMapPathFeatureKindId, LocationMapPathSegment[]>();
  for (const seg of filtered) {
    let list = byKind.get(seg.kind);
    if (!list) {
      list = [];
      byKind.set(seg.kind, list);
    }
    list.push(seg);
  }

  const result: { kind: LocationMapPathFeatureKindId; cells: string[] }[] = [];

  for (const [kind, segs] of byKind) {
    const adj = new Map<string, Set<string>>();
    const addEdge = (a: string, b: string) => {
      let s = adj.get(a);
      if (!s) { s = new Set(); adj.set(a, s); }
      s.add(b);
    };
    for (const seg of segs) {
      addEdge(seg.startCellId, seg.endCellId);
      addEdge(seg.endCellId, seg.startCellId);
    }

    const visited = new Set<string>();
    const edgeUsed = new Set<string>();
    const edgeKey = (a: string, b: string) => a <= b ? `${a}|${b}` : `${b}|${a}`;

    const endpoints = [...adj.entries()]
      .filter(([, neighbors]) => neighbors.size === 1)
      .map(([id]) => id);

    const startNodes = endpoints.length > 0
      ? endpoints
      : [...adj.keys()];

    for (const start of startNodes) {
      if (visited.has(start) && adj.get(start)!.size <= 2) continue;

      const chain: string[] = [start];
      visited.add(start);
      let current = start;

      while (true) {
        const neighbors = adj.get(current);
        if (!neighbors) break;
        let next: string | null = null;
        for (const n of neighbors) {
          const ek = edgeKey(current, n);
          if (!edgeUsed.has(ek)) {
            next = n;
            edgeUsed.add(ek);
            break;
          }
        }
        if (!next) break;
        chain.push(next);
        visited.add(next);
        current = next;
        if ((adj.get(current)?.size ?? 0) > 2) break;
      }

      if (chain.length >= 2) {
        result.push({ kind, cells: chain });
      }
    }
  }

  return result;
}

/**
 * Convert a sequence of pixel points into an SVG path `d` attribute using
 * Catmull-Rom to cubic Bezier conversion for smooth curves.
 *
 * - 0-1 points: returns empty string
 * - 2 points: straight line (M ... L ...)
 * - 3+ points: smooth Catmull-Rom spline (M ... C ...)
 *
 * @param alpha Catmull-Rom tension (0 = uniform, 0.5 = centripetal, 1 = chordal). Default 0.5.
 */
export function chainToSmoothSvgPath(
  points: readonly Point[],
  alpha = 0.5,
): string {
  if (points.length < 2) return '';
  if (points.length === 2) {
    return `M${r(points[0].cx)},${r(points[0].cy)} L${r(points[1].cx)},${r(points[1].cy)}`;
  }

  const pts = [
    mirrorPoint(points[0], points[1]),
    ...points,
    mirrorPoint(points[points.length - 1], points[points.length - 2]),
  ];

  const parts: string[] = [`M${r(points[0].cx)},${r(points[0].cy)}`];

  for (let i = 0; i < pts.length - 3; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const p2 = pts[i + 2];
    const p3 = pts[i + 3];
    const cp = catmullRomToBezier(p0, p1, p2, p3, alpha);
    parts.push(
      `C${r(cp.cp1x)},${r(cp.cp1y)} ${r(cp.cp2x)},${r(cp.cp2y)} ${r(p2.cx)},${r(p2.cy)}`,
    );
  }

  return parts.join(' ');
}

/**
 * Build smooth SVG path data from path segments, using the provided
 * center function to map cell IDs to pixel coordinates.
 */
export function pathSegmentsToSvgPaths(
  segments: readonly LocationMapPathSegment[],
  centerFn: CenterFn,
): { kind: LocationMapPathFeatureKindId; d: string }[] {
  const chains = buildPathChains(segments);
  const result: { kind: LocationMapPathFeatureKindId; d: string }[] = [];

  for (const chain of chains) {
    const points: Point[] = [];
    for (const cellId of chain.cells) {
      const pt = centerFn(cellId);
      if (pt) points.push(pt);
    }
    if (points.length < 2) continue;
    const d = chainToSmoothSvgPath(points);
    result.push({ kind: chain.kind, d });
  }

  return result;
}

function mirrorPoint(anchor: Point, other: Point): Point {
  return { cx: 2 * anchor.cx - other.cx, cy: 2 * anchor.cy - other.cy };
}

function catmullRomToBezier(
  p0: Point, p1: Point, p2: Point, p3: Point, alpha: number,
): { cp1x: number; cp1y: number; cp2x: number; cp2y: number } {
  const d1 = Math.hypot(p1.cx - p0.cx, p1.cy - p0.cy);
  const d2 = Math.hypot(p2.cx - p1.cx, p2.cy - p1.cy);
  const d3 = Math.hypot(p3.cx - p2.cx, p3.cy - p2.cy);

  const d1a = Math.pow(d1, alpha);
  const d2a = Math.pow(d2, alpha);
  const d3a = Math.pow(d3, alpha);
  const d1_2a = Math.pow(d1, 2 * alpha);
  const d2_2a = Math.pow(d2, 2 * alpha);
  const d3_2a = Math.pow(d3, 2 * alpha);

  const denom1 = 3 * d1a * (d1a + d2a);
  const denom2 = 3 * d3a * (d3a + d2a);

  const cp1x = denom1 > 0
    ? (d1_2a * p2.cx - d2_2a * p0.cx + (2 * d1_2a + 3 * d1a * d2a + d2_2a) * p1.cx) / denom1
    : p1.cx;
  const cp1y = denom1 > 0
    ? (d1_2a * p2.cy - d2_2a * p0.cy + (2 * d1_2a + 3 * d1a * d2a + d2_2a) * p1.cy) / denom1
    : p1.cy;

  const cp2x = denom2 > 0
    ? (d3_2a * p1.cx - d2_2a * p3.cx + (2 * d3_2a + 3 * d3a * d2a + d2_2a) * p2.cx) / denom2
    : p2.cx;
  const cp2y = denom2 > 0
    ? (d3_2a * p1.cy - d2_2a * p3.cy + (2 * d3_2a + 3 * d3a * d2a + d2_2a) * p2.cy) / denom2
    : p2.cy;

  return { cp1x, cp1y, cp2x, cp2y };
}

function r(n: number): string {
  return Number(n.toFixed(2)).toString();
}
