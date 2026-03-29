/**
 * Single entry point for location feature validation helpers (re-exports + naming).
 * Pure domain checks live under ../domain; persistence-aware checks live in *Validation.ts modules.
 */

export {
  buildAncestorIdsFromParentRow,
  LOCATION_SCALE_ORDER,
  scaleRank,
  validateParentChildScales as validateLocationScaleNesting,
} from '../domain/locations.hierarchy';
export type { HierarchyValidationError, LocationScaleId } from '../domain/locations.hierarchy';

export {
  cellIdExistsOnMap,
  cellIdsOnMap,
  validateCellUnitForKind,
  validateGridDimensions,
  validateLocationMapCells,
  validateLocationMapInput,
  validateMapKind,
} from '../domain/locationMaps.validation';
export type { MapValidationError } from '../domain/locationMaps.validation';

export {
  validateLocationTransitionInput,
  validateSourceCell,
  validateSourceMap,
  validateTargetLocation,
  validateTargetMapAndCells,
  validateTransitionKind,
} from './locationTransitionValidation';
export type { TransitionValidationError } from './locationTransitionValidation';
