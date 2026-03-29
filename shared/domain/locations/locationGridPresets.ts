/**
 * Reusable rectangular presets for location map bootstrapping (columns × rows).
 * Encounter combat grid uses the same presets for consistency.
 */
export type LocationGridSizePresetId = 'small' | 'medium' | 'large';

export const LOCATION_GRID_SIZE_PRESETS: Record<
  LocationGridSizePresetId,
  { columns: number; rows: number; label: string; description: string }
> = {
  small: {
    columns: 8,
    rows: 6,
    label: 'Small',
    description: '8 × 6 (40 × 30 ft)',
  },
  medium: {
    columns: 12,
    rows: 10,
    label: 'Medium',
    description: '12 × 10 (60 × 50 ft)',
  },
  large: {
    columns: 16,
    rows: 12,
    label: 'Large',
    description: '16 × 12 (80 × 60 ft)',
  },
};
