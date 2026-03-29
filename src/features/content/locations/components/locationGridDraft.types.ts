import type { LocationMapObjectKindId } from '@/shared/domain/locations';

export type LocationCellObjectDraft = {
  id: string;
  kind: LocationMapObjectKindId;
  label?: string;
};

export type LocationGridDraftState = {
  selectedCellId: string | null;
  excludedCellIds: string[];
  /** At most one linked campaign location id per cell. */
  linkedLocationByCellId: Record<string, string | undefined>;
  /** Simple objects placed on each cell (authoring draft). */
  objectsByCellId: Record<string, LocationCellObjectDraft[]>;
  /** When set, the cell edit modal is open for this cell id. */
  cellModalCellId: string | null;
};

export const INITIAL_LOCATION_GRID_DRAFT: LocationGridDraftState = {
  selectedCellId: null,
  excludedCellIds: [],
  linkedLocationByCellId: {},
  objectsByCellId: {},
  cellModalCellId: null,
};
