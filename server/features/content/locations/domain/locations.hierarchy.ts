/**
 * Pure hierarchy rules for locations (scale ordering + ancestor id construction).
 * Parent/child *scale pairing* is enforced via explicit policy in shared `locationScale.policy.ts`
 * (`isAllowedParentScale`), not by rank comparison alone.
 * Async DB validation lives in locations.service.ts.
 */

import {
  LOCATION_SCALE_ORDER,
  type LocationScaleId,
} from '../../../../../shared/domain/locations';
import { isAllowedParentScale } from '../../../../../shared/domain/locations/locationScale.policy';
import { isValidLocationScaleId } from '../../../../../shared/domain/locations/locationScale.rules';

export { LOCATION_SCALE_ORDER, type LocationScaleId };

export type HierarchyValidationError = {
  path: string;
  code: string;
  message: string;
};

/** Lower index = broader geographic scope. Returns -1 if scale is unknown. */
export function scaleRank(scale: string): number {
  return LOCATION_SCALE_ORDER.indexOf(scale as LocationScaleId);
}

/**
 * Parent scale must be allowed for the child scale (explicit policy map).
 */
export function validateParentChildScales(
  parentScale: string,
  childScale: string,
): HierarchyValidationError | null {
  if (!isValidLocationScaleId(parentScale)) {
    return {
      path: 'parentId',
      code: 'INVALID_SCALE',
      message: `Parent has unknown scale "${parentScale}"`,
    };
  }
  if (!isValidLocationScaleId(childScale)) {
    return {
      path: 'scale',
      code: 'INVALID_SCALE',
      message: `Unknown scale "${childScale}"`,
    };
  }
  if (!isAllowedParentScale(parentScale, childScale)) {
    return {
      path: 'parentId',
      code: 'INVALID_NESTING',
      message: 'Parent scale is not allowed for this location scale',
    };
  }
  return null;
}

/** ancestorIds for a node whose parent is `parentRow` (root has no parent row). */
export function buildAncestorIdsFromParentRow(parentRow: {
  locationId: string;
  ancestorIds?: string[];
}): string[] {
  const ancestors = parentRow.ancestorIds ?? [];
  return [...ancestors, parentRow.locationId];
}
