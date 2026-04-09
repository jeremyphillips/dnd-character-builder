import Box from '@mui/material/Box';

import type { LocationMapUiResolvedStyles } from '@/features/content/locations/domain/presentation/map/locationMapUiStyles';
import type { ResolvedEdgeTarget } from '@/features/content/locations/domain/authoring/editor';
import type { LocationMapSelection } from '@/features/content/locations/components/workspace/rightRail/types';
import type {
  EdgeSegmentGeometry,
  LineSegment2D,
} from '@/shared/domain/locations/map/locationMapGeometry.types';

import {
  HexMapAuthoringPathSvgOverlay,
  HexMapAuthoringRegionSvgOverlay,
} from '../mapGrid/authoring/HexMapAuthoringSvgOverlay';
import { SquareMapAuthoringSvgOverlay } from '../mapGrid/authoring/SquareMapAuthoringSvgOverlay';
import type { LocationGridPathSvgPreviewItem } from './locationGridAuthoringPathSvgPreview';
import { LocationMapHexAuthoredObjectIconsLayer } from '../mapGrid/LocationMapAuthoredObjectIconsLayer';
import type { LocationMapAuthoredObjectRenderItem } from '@/shared/domain/locations/map/locationMapAuthoredObjectRender.types';

/** Below grid: paths + edges (placed objects and cell chrome stack above). */
const Z_MAP_PATH_EDGE_UNDER_GRID = 0;
/** Above paths: cell grid + per-cell overlays (fills, objects, linked icons). */
const Z_MAP_CELL_GRID = 1;
/**
 * Hex path splines **above** the cell grid. Unlike square maps, hex cells tessellate with no
 * inter-cell gap — roads/rivers drawn under the grid would be fully covered. Square keeps paths
 * {@link Z_MAP_PATH_EDGE_UNDER_GRID} so strokes show in gaps and objects stay above paths.
 */
const Z_MAP_HEX_PATH_OVER_GRID = 2;
/** Above hex paths: placed-object glyphs (global layer; cell overlay suppresses duplicates). */
const Z_MAP_HEX_PLACED_OBJECTS = 3;
/** Above placed objects: region hull outlines (selection UX). */
const Z_MAP_HEX_REGION_OUTLINES = 4;

type SquareGeom = { width: number; height: number; cellPx: number };
type HexGeom = { width: number; height: number };

/**
 * Absolutely positioned square overlay (paths, edges, boundary paint) **below** the interactive cell grid.
 */
export function LocationGridAuthoringSquareMapOverlayLayer(props: {
  visible: boolean;
  squareGridGeometry: SquareGeom | null;
  mapUi: LocationMapUiResolvedStyles;
  hostScale: string;
  pathSvgData: readonly LocationGridPathSvgPreviewItem[];
  mapSelection: LocationMapSelection;
  selectHoverTarget: LocationMapSelection;
  edgeStrokeSnapshot: readonly string[];
  edgeHoverTarget: ResolvedEdgeTarget | null;
  edgeEraseActive: boolean;
  committedEdgeSegmentGeometry: readonly EdgeSegmentGeometry[];
}) {
  const {
    visible,
    squareGridGeometry,
    mapUi,
    hostScale,
    pathSvgData,
    mapSelection,
    selectHoverTarget,
    edgeStrokeSnapshot,
    edgeHoverTarget,
    edgeEraseActive,
    committedEdgeSegmentGeometry,
  } = props;

  if (!visible || !squareGridGeometry) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: squareGridGeometry.width,
        height: squareGridGeometry.height,
        zIndex: Z_MAP_PATH_EDGE_UNDER_GRID,
        pointerEvents: 'none',
      }}
    >
      <SquareMapAuthoringSvgOverlay
        width={squareGridGeometry.width}
        height={squareGridGeometry.height}
        cellPx={squareGridGeometry.cellPx}
        mapUi={mapUi}
        hostScale={hostScale}
        pathSvgData={[...pathSvgData]}
        mapSelection={mapSelection}
        selectHoverTarget={selectHoverTarget}
        edgeStrokeSnapshot={[...edgeStrokeSnapshot]}
        edgeHoverTarget={edgeHoverTarget}
        edgeEraseActive={edgeEraseActive}
        committedEdgeSegmentGeometry={[...committedEdgeSegmentGeometry]}
      />
    </Box>
  );
}

/**
 * Hex path splines only — **below** the cell grid so markers/objects paint above roads/rivers.
 */
export function LocationGridAuthoringHexMapPathOverlayLayer(props: {
  visible: boolean;
  hexGridGeometry: HexGeom | null;
  mapUi: LocationMapUiResolvedStyles;
  hostScale: string;
  pathSvgData: readonly LocationGridPathSvgPreviewItem[];
  mapSelection: LocationMapSelection;
  selectHoverTarget: LocationMapSelection;
}) {
  const {
    visible,
    hexGridGeometry,
    mapUi,
    hostScale,
    pathSvgData,
    mapSelection,
    selectHoverTarget,
  } = props;

  if (!visible || !hexGridGeometry) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: hexGridGeometry.width,
        height: hexGridGeometry.height,
        zIndex: Z_MAP_HEX_PATH_OVER_GRID,
        pointerEvents: 'none',
      }}
    >
      <HexMapAuthoringPathSvgOverlay
        width={hexGridGeometry.width}
        height={hexGridGeometry.height}
        mapUi={mapUi}
        hostScale={hostScale}
        pathSvgData={[...pathSvgData]}
        mapSelection={mapSelection}
        selectHoverTarget={selectHoverTarget}
      />
    </Box>
  );
}

/**
 * Hex placed-object + place-preview glyphs — **above** path SVG, **below** region hull outlines.
 */
export function LocationGridAuthoringHexMapPlacedObjectsOverlayLayer(props: {
  visible: boolean;
  hexGridGeometry: HexGeom | null;
  mapUi: LocationMapUiResolvedStyles;
  selectHoverTarget: LocationMapSelection;
  items: readonly LocationMapAuthoredObjectRenderItem[];
  hexSize: number;
}) {
  const { visible, hexGridGeometry, mapUi, selectHoverTarget, items, hexSize } = props;

  if (!visible || !hexGridGeometry || items.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: hexGridGeometry.width,
        height: hexGridGeometry.height,
        zIndex: Z_MAP_HEX_PLACED_OBJECTS,
        pointerEvents: 'none',
      }}
    >
      <LocationMapHexAuthoredObjectIconsLayer
        items={items}
        hexSize={hexSize}
        mapUi={mapUi}
        footprintLayout={null}
        selectHoverTarget={selectHoverTarget}
      />
    </Box>
  );
}

/**
 * Hex region hull outlines — **above** paths and placed-object glyphs (selection UX).
 */
export function LocationGridAuthoringHexMapRegionOverlayLayer(props: {
  visible: boolean;
  hexGridGeometry: HexGeom | null;
  mapUi: LocationMapUiResolvedStyles;
  mapSelection: LocationMapSelection;
  selectHoverTarget: LocationMapSelection;
  hexSelectedRegionBoundarySegments: LineSegment2D[];
  hexHoverRegionBoundarySegments: LineSegment2D[];
}) {
  const {
    visible,
    hexGridGeometry,
    mapUi,
    mapSelection,
    selectHoverTarget,
    hexSelectedRegionBoundarySegments,
    hexHoverRegionBoundarySegments,
  } = props;

  if (!visible || !hexGridGeometry) return null;

  return (
    <Box
      sx={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: hexGridGeometry.width,
        height: hexGridGeometry.height,
        zIndex: Z_MAP_HEX_REGION_OUTLINES,
        pointerEvents: 'none',
      }}
    >
      <HexMapAuthoringRegionSvgOverlay
        width={hexGridGeometry.width}
        height={hexGridGeometry.height}
        mapUi={mapUi}
        mapSelection={mapSelection}
        selectHoverTarget={selectHoverTarget}
        hexSelectedRegionBoundarySegments={hexSelectedRegionBoundarySegments}
        hexHoverRegionBoundarySegments={hexHoverRegionBoundarySegments}
      />
    </Box>
  );
}

export { Z_MAP_CELL_GRID };
