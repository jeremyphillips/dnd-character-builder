import type { LocationMapEdgeAuthoringEntry } from '@/shared/domain/locations';
import type { EdgeSegmentGeometry, PathPolylineGeometry } from '@/shared/domain/locations/map/locationMapGeometry.types';

import type { LocationMapSelection } from '@/features/content/locations/components/workspace/rightRail/types';
import { getSquareEdgeOrientationFromEdgeId } from '../edge';
import {
  DEFAULT_EDGE_PICK_HALF_WIDTH_PX,
  DEFAULT_PATH_PICK_TOLERANCE_PX,
  resolveNearestEdgeHit,
  resolveNearestPathHit,
} from './locationMapSelectionHitTest';
import { deriveSquareEdgeRunSelection } from '../edge';
import { resolveSelectModeAfterPathEdgeHits } from './resolveSelectModeRegionOrCellSelection';

type Objectish = { id: string };

export type ResolveSelectModeInteractiveTargetParams = {
  /** Event target (or elementFromPoint) for DOM hits on object / linked icons. */
  targetElement: HTMLElement | null;
  /**
   * Viewport coordinates for `document.elementsFromPoint`. When set with {@link clientY}, the
   * resolver walks the hit-test stack so `[data-map-object-id]` wins over SVG paths/edges drawn
   * above the cell grid (same priority as topmost pixel alone would miss the icon).
   */
  clientX?: number;
  clientY?: number;
  /** Pointer position in grid-local pixels. */
  gx: number;
  gy: number;
  /** Cell used for interior resolution when geometry does not pick path/edge. */
  anchorCellId: string;
  objectsByCellId: Record<string, Objectish[] | undefined>;
  linkedLocationByCellId: Record<string, string | undefined>;
  regionIdByCellId: Record<string, string | undefined>;
  pathPolys: readonly PathPolylineGeometry[];
  /** Square grid only; when null or empty, edge picking is skipped. */
  edgeGeoms: readonly EdgeSegmentGeometry[] | null;
  edgeEntries: readonly LocationMapEdgeAuthoringEntry[];
  isHex: boolean;
  /**
   * When true, skip path/edge geometry (e.g. grid container not ready).
   * Still applies DOM object/link and draft interior resolution.
   */
  skipGeometry?: boolean;
};

function edgeHitToSelection(
  edgeHit: { edgeId: string },
  edgeEntries: readonly LocationMapEdgeAuthoringEntry[],
): LocationMapSelection | null {
  const run = deriveSquareEdgeRunSelection(edgeHit.edgeId, edgeEntries);
  const entry = edgeEntries.find((e) => e.edgeId === edgeHit.edgeId);
  const axis = entry ? getSquareEdgeOrientationFromEdgeId(edgeHit.edgeId) : null;
  if (run) {
    return {
      type: 'edge-run',
      kind: run.kind,
      edgeIds: run.edgeIds,
      axis: run.axis,
      anchorEdgeId: run.anchorEdgeId,
    };
  }
  if (entry && axis) {
    return {
      type: 'edge-run',
      kind: entry.kind,
      edgeIds: [edgeHit.edgeId],
      axis,
      anchorEdgeId: edgeHit.edgeId,
    };
  }
  return null;
}

function gridcellButtonForAnchorCellId(
  anchorCellId: string,
  scopeRoot: Document | HTMLElement,
): HTMLElement | null {
  if (typeof scopeRoot.querySelector !== 'function') {
    return null;
  }
  /** Attribute selector value: escape `\` and `"` only (avoid CSS.escape — it targets identifiers, not arbitrary attribute values). */
  const v = anchorCellId.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return scopeRoot.querySelector(`[role="gridcell"][data-cell-id="${v}"]`);
}

/** Prefer the candidate that appears highest in the hit-test stack (smallest index = topmost). */
function pickTopmostDomCandidate<T extends Element>(
  candidates: readonly T[],
  stack: Element[],
): T | null {
  let best: T | null = null;
  let bestIdx = Infinity;
  for (const el of candidates) {
    const idx = stack.indexOf(el);
    if (idx >= 0 && idx < bestIdx) {
      bestIdx = idx;
      best = el;
    }
  }
  return best;
}

/**
 * When SVG/overlay sits above icons, `closest` from the top hit never reaches in-cell icons.
 * Scan all object/link rects under the scoped grid and break ties using the hit-test stack order.
 */
function pickObjectOrLinkedByGridWideRects(
  gridRoot: HTMLElement,
  clientX: number,
  clientY: number,
  stack: Element[],
  anchorCellId: string,
): LocationMapSelection | null {
  const objectCandidates: HTMLElement[] = [];
  const objectNodes = gridRoot.querySelectorAll('[data-map-object-id]');
  for (let i = 0; i < objectNodes.length; i++) {
    const el = objectNodes[i];
    if (!(el instanceof HTMLElement)) continue;
    const r = el.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) continue;
    objectCandidates.push(el);
  }
  if (objectCandidates.length > 0) {
    let chosen =
      pickTopmostDomCandidate(objectCandidates, stack) ??
      objectCandidates.find((c) => c.getAttribute('data-map-object-cell-id') === anchorCellId) ??
      objectCandidates[0] ??
      null;
    if (chosen) {
      const objectId = chosen.getAttribute('data-map-object-id');
      const cellId = chosen.getAttribute('data-map-object-cell-id') ?? anchorCellId;
      if (objectId) {
        return { type: 'object', cellId, objectId };
      }
    }
  }

  const linkedCandidates: HTMLElement[] = [];
  const linkedNodes = gridRoot.querySelectorAll('[data-map-linked-cell]');
  for (let i = 0; i < linkedNodes.length; i++) {
    const el = linkedNodes[i];
    if (!(el instanceof HTMLElement)) continue;
    const r = el.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) continue;
    linkedCandidates.push(el);
  }
  if (linkedCandidates.length > 0) {
    const chosen =
      pickTopmostDomCandidate(linkedCandidates, stack) ??
      linkedCandidates.find((c) => c.getAttribute('data-map-linked-cell') === anchorCellId) ??
      linkedCandidates[0] ??
      null;
    if (chosen) {
      const cellId = chosen.getAttribute('data-map-linked-cell') ?? anchorCellId;
      return { type: 'cell', cellId };
    }
  }
  return null;
}

function pickDomMapSelectionFromStack(
  clientX: number,
  clientY: number,
  anchorCellId: string,
): LocationMapSelection | null {
  if (typeof document === 'undefined' || typeof document.elementsFromPoint !== 'function') {
    return null;
  }
  const stack = document.elementsFromPoint(clientX, clientY);
  for (const node of stack) {
    const el = node instanceof HTMLElement ? node : null;
    if (!el) continue;
    const objWrap = el.closest('[data-map-object-id]');
    if (objWrap) {
      const objectId = objWrap.getAttribute('data-map-object-id');
      const cellId = objWrap.getAttribute('data-map-object-cell-id') ?? anchorCellId;
      if (objectId) {
        return { type: 'object', cellId, objectId };
      }
    }
    const linkedWrap = el.closest('[data-map-linked-cell]');
    if (linkedWrap) {
      const cellId = linkedWrap.getAttribute('data-map-linked-cell') ?? anchorCellId;
      return { type: 'cell', cellId };
    }
  }
  /**
   * Hex (and some clip-path) cells: `elementsFromPoint` may list a grid container or other wrapper
   * above the gridcell button, or omit icon nodes entirely. `Element.closest` only walks ancestors,
   * so it never finds `[data-map-object-id]` on descendants of the cell button. Resolve by locating
   * the anchor cell's gridcell and testing client coords against icon/link bounding rects.
   *
   * Prefer querying inside the `[role=grid]` from the hit stack (runtime evidence: top hit is often
   * that grid div) so we do not match a gridcell from another map when multiple grids exist.
   */
  const gridRoot = stack.find(
    (n): n is HTMLElement => n instanceof HTMLElement && n.getAttribute('role') === 'grid',
  );
  if (gridRoot) {
    const gridWide = pickObjectOrLinkedByGridWideRects(
      gridRoot,
      clientX,
      clientY,
      stack,
      anchorCellId,
    );
    if (gridWide) {
      return gridWide;
    }
  }

  let cellBtn = gridRoot ? gridcellButtonForAnchorCellId(anchorCellId, gridRoot) : null;
  if (!cellBtn && typeof document !== 'undefined') {
    cellBtn = gridcellButtonForAnchorCellId(anchorCellId, document);
  }
  if (cellBtn) {
    const objectNodes = cellBtn.querySelectorAll('[data-map-object-id]');
    for (let i = 0; i < objectNodes.length; i++) {
      const el = objectNodes[i];
      if (!(el instanceof HTMLElement)) continue;
      const r = el.getBoundingClientRect();
      if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) continue;
      const objectId = el.getAttribute('data-map-object-id');
      const cellId = el.getAttribute('data-map-object-cell-id') ?? anchorCellId;
      if (objectId) {
        return { type: 'object', cellId, objectId };
      }
    }
    const linkedEl = cellBtn.querySelector('[data-map-linked-cell]');
    if (linkedEl instanceof HTMLElement) {
      const r = linkedEl.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        const cellId = linkedEl.getAttribute('data-map-linked-cell') ?? anchorCellId;
        return { type: 'cell', cellId };
      }
    }
  }
  return null;
}

/**
 * Single winning interactive target for Select mode: same priority for hover preview and click.
 *
 * Priority: object / linked (DOM stack at client coords when provided) → single targetElement DOM →
 * edge (square geometry) → path (geometry) → draft interior via {@link resolveSelectModeAfterPathEdgeHits}.
 */
export function resolveSelectModeInteractiveTarget(
  p: ResolveSelectModeInteractiveTargetParams,
): LocationMapSelection {
  if (p.clientX != null && p.clientY != null) {
    const fromStack = pickDomMapSelectionFromStack(p.clientX, p.clientY, p.anchorCellId);
    if (fromStack) return fromStack;
  }

  const el = p.targetElement;
  if (el) {
    const objWrap = el.closest('[data-map-object-id]');
    if (objWrap) {
      const objectId = objWrap.getAttribute('data-map-object-id');
      const cellId = objWrap.getAttribute('data-map-object-cell-id') ?? p.anchorCellId;
      if (objectId) {
        return { type: 'object', cellId, objectId };
      }
    }
    const linkedWrap = el.closest('[data-map-linked-cell]');
    if (linkedWrap) {
      const cellId = linkedWrap.getAttribute('data-map-linked-cell') ?? p.anchorCellId;
      return { type: 'cell', cellId };
    }
  }

  if (!p.skipGeometry && !p.isHex && p.edgeGeoms && p.edgeGeoms.length > 0) {
    const edgeHit = resolveNearestEdgeHit(p.gx, p.gy, p.edgeGeoms, DEFAULT_EDGE_PICK_HALF_WIDTH_PX);
    if (edgeHit) {
      const sel = edgeHitToSelection(edgeHit, p.edgeEntries);
      if (sel) {
        return sel;
      }
    }
  }

  if (!p.skipGeometry) {
    const pathHit = resolveNearestPathHit(p.gx, p.gy, p.pathPolys, DEFAULT_PATH_PICK_TOLERANCE_PX);
    if (pathHit) {
      return { type: 'path', pathId: pathHit.pathId };
    }
  }

  return resolveSelectModeAfterPathEdgeHits(
    p.anchorCellId,
    p.objectsByCellId,
    p.linkedLocationByCellId,
    p.regionIdByCellId,
  );
}
