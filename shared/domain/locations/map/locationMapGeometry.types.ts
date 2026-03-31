import type { LocationMapEdgeKindId } from './locationMapEdgeFeature.constants';
import type { LocationMapPathKindId } from './locationMapPathFeature.constants';

/** Renderer-agnostic point in pixel space (shared geometry layer). */
export type Point2D = {
  x: number;
  y: number;
};

/** Axis-aligned or general segment in pixel space. */
export type LineSegment2D = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

/** One authored path chain as a polyline (no SVG). */
export type PathPolylineGeometry = {
  id: string;
  kind: LocationMapPathKindId;
  points: Point2D[];
};

/**
 * One edge feature as a boundary segment (square grids only in this pass).
 * Hex edge boundary geometry is not modeled here.
 */
export type EdgeSegmentGeometry = {
  edgeId: string;
  kind: LocationMapEdgeKindId;
  segment: LineSegment2D;
};
