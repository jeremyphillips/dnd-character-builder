import type {
  LocationMapBase,
  LocationMapCellAuthoringEntry,
  LocationMapEdgeAuthoringEntry,
  LocationMapPathAuthoringEntry,
} from './locationMap.types';

/**
 * Runtime normalization for persisted/API map authoring fields.
 * Ensures `cellEntries`, `pathEntries`, and `edgeEntries` are arrays (never undefined).
 * Does not change authored meaning when arrays are already present.
 */
export function normalizeLocationMapAuthoringFields(input: {
  cellEntries?: unknown;
  pathEntries?: unknown;
  edgeEntries?: unknown;
}): {
  cellEntries: LocationMapCellAuthoringEntry[];
  pathEntries: LocationMapPathAuthoringEntry[];
  edgeEntries: LocationMapEdgeAuthoringEntry[];
} {
  return {
    cellEntries: Array.isArray(input.cellEntries)
      ? (input.cellEntries as LocationMapCellAuthoringEntry[])
      : [],
    pathEntries: Array.isArray(input.pathEntries)
      ? (input.pathEntries as LocationMapPathAuthoringEntry[])
      : [],
    edgeEntries: Array.isArray(input.edgeEntries)
      ? (input.edgeEntries as LocationMapEdgeAuthoringEntry[])
      : [],
  };
}

/**
 * Apply {@link normalizeLocationMapAuthoringFields} to a map loaded from persistence or the API.
 */
export function normalizeLocationMapBaseAuthoring(map: LocationMapBase): LocationMapBase {
  const a = normalizeLocationMapAuthoringFields(map);
  return { ...map, ...a };
}
