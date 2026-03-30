/**
 * UI / listing policy for location scales — where a scale appears (standalone create, campaign list,
 * building interior) without duplicating ad hoc checks in routes.
 *
 * Field rules stay in `locationScaleField.policy.ts`; this module is **presentation routing** only.
 */
import {
  INTERIOR_LOCATION_SCALE_IDS,
  SURFACE_LOCATION_CONTENT_SCALE_IDS,
} from '../location.constants';
import { isValidLocationScaleId } from './locationScale.rules';

export function isInteriorLocationScale(scale: string): boolean {
  return (INTERIOR_LOCATION_SCALE_IDS as readonly string[]).includes(scale);
}

/** Campaign list rows: all persisted scales except interior (floor/room live under building UX). */
export function isCampaignLocationListScale(scale: string): boolean {
  return isValidLocationScaleId(scale) && !isInteriorLocationScale(scale);
}

/** Standalone “new location” setup — macro + building only (see `SURFACE_LOCATION_CONTENT_SCALE_IDS`). */
export function isStandaloneCreateLocationScale(scale: string): boolean {
  return (SURFACE_LOCATION_CONTENT_SCALE_IDS as readonly string[]).includes(scale);
}
