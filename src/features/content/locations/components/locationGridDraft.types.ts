import type {
  LocationMapCellFillKindId,
  LocationMapCellObjectEntry,
  LocationMapEdgeAuthoringEntry,
  LocationMapPathAuthoringEntry,
} from '@/shared/domain/locations';

/** Same shape as persisted map cell objects. */
export type LocationCellObjectDraft = LocationMapCellObjectEntry;

export type LocationGridDraftState = {
  selectedCellId: string | null;
  excludedCellIds: string[];
  /** At most one linked campaign location id per cell. */
  linkedLocationByCellId: Record<string, string | undefined>;
  /** Simple objects placed on each cell (authoring draft). */
  objectsByCellId: Record<string, LocationCellObjectDraft[]>;
  /** Whole-cell terrain / surface fill (sparse). */
  cellFillByCellId: Record<string, LocationMapCellFillKindId | undefined>;
  /** Map-level path chains (persisted on LocationMap). */
  pathEntries: LocationMapPathAuthoringEntry[];
  /** Map-level edge features on boundaries (persisted on LocationMap). */
  edgeEntries: LocationMapEdgeAuthoringEntry[];
};

export const INITIAL_LOCATION_GRID_DRAFT: LocationGridDraftState = {
  selectedCellId: null,
  excludedCellIds: [],
  linkedLocationByCellId: {},
  objectsByCellId: {},
  cellFillByCellId: {},
  pathEntries: [],
  edgeEntries: [],
};
