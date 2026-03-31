import {
  CONTENT_LOCATION_SCALE_IDS,
  LEGACY_MAP_ZONE_LOCATION_SCALE_IDS,
  LOCATION_CONNECTION_KIND_IDS,
  LOCATION_CATEGORY_IDS,
  SURFACE_LOCATION_CONTENT_SCALE_IDS,
} from './location.constants';

/** First-class content location scales (authoring + field policy). */
export type ContentLocationScaleId = (typeof CONTENT_LOCATION_SCALE_IDS)[number];

/** Standalone create + top-level campaign list (world, city, site, building). */
export type SurfaceLocationContentScaleId = (typeof SURFACE_LOCATION_CONTENT_SCALE_IDS)[number];

/** Legacy scales still valid in persisted data; not for new authoring. */
export type LegacyMapZoneLocationScaleId = (typeof LEGACY_MAP_ZONE_LOCATION_SCALE_IDS)[number];

/** Any campaign location scale (content + legacy). */
export type LocationScaleId = ContentLocationScaleId | LegacyMapZoneLocationScaleId;

export type LocationCategoryId = (typeof LOCATION_CATEGORY_IDS)[number];

export type LocationConnectionKindId = (typeof LOCATION_CONNECTION_KIND_IDS)[number];

/** Display label block (short title / numbering) used by campaign locations. */
export type LocationLabel = {
  short?: string;
  number?: string;
};

export type LocationConnection = {
  toId: string;
  kind: LocationConnectionKindId;
  bidirectional?: boolean;
  locked?: boolean;
  dc?: number;
  keyItemId?: string;
};
