import { LOCATION_SCALE_RANK_ORDER_LEGACY } from '@/shared/domain/locations';

export const LOCATION_SCALE_FILTER_OPTIONS = LOCATION_SCALE_RANK_ORDER_LEGACY.map((s) => ({
  value: s,
  label: s,
}));

export const LOCATION_SOURCE_FILTER_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'campaign', label: 'Campaign' },
] as const;
