import { CAMPAIGN_LOCATION_LIST_SCALE_IDS } from '@/shared/domain/locations';

/** List filter: same scales as campaign rows (excludes floor/room). */
export const LOCATION_SCALE_FILTER_OPTIONS = CAMPAIGN_LOCATION_LIST_SCALE_IDS.map((s) => ({
  value: s,
  label: s,
}));

export const LOCATION_SOURCE_FILTER_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'campaign', label: 'Campaign' },
] as const;
