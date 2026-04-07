import { describe, expect, it } from 'vitest';

import type { LocationMapRegionAuthoringEntry } from '@/shared/domain/locations';
import {
  LOCATION_MAP_DEFAULT_REGION_NAME,
  LOCATION_MAP_REGION_COLOR_KEYS,
} from '@/shared/domain/locations/map/locationMapRegion.constants';

import {
  canApplyAnyPaintStroke,
  canApplyRegionPaint,
  createInitialPaintState,
  resolveActiveRegionEntry,
} from '../../paint';

const sampleRegions: LocationMapRegionAuthoringEntry[] = [
  {
    id: 'r1',
    colorKey: 'regionRed',
    name: LOCATION_MAP_DEFAULT_REGION_NAME,
  },
];

const pending = LOCATION_MAP_REGION_COLOR_KEYS[0];

describe('locationMapPaintSelection.helpers', () => {
  it('createInitialPaintState starts in surface with no active region', () => {
    const s = createInitialPaintState();
    expect(s.domain).toBe('surface');
    expect(s.selectedSurfaceFill).toBeNull();
    expect(s.activeRegionId).toBeNull();
    expect(s.pendingRegionColorKey).toBe(pending);
  });

  it('canApplyRegionPaint requires domain region and extend or create intent', () => {
    expect(canApplyRegionPaint(null, sampleRegions)).toBe(false);
    expect(
      canApplyRegionPaint(
        {
          domain: 'region',
          selectedSurfaceFill: null,
          activeRegionId: null,
          pendingRegionColorKey: pending,
        },
        sampleRegions,
      ),
    ).toBe(true);
    expect(
      canApplyRegionPaint(
        {
          domain: 'region',
          selectedSurfaceFill: null,
          activeRegionId: 'r1',
          pendingRegionColorKey: pending,
        },
        sampleRegions,
      ),
    ).toBe(true);
    expect(
      canApplyRegionPaint(
        {
          domain: 'region',
          selectedSurfaceFill: null,
          activeRegionId: 'missing',
          pendingRegionColorKey: pending,
        },
        sampleRegions,
      ),
    ).toBe(false);
  });

  it('canApplyAnyPaintStroke combines surface and region rules', () => {
    expect(
      canApplyAnyPaintStroke(
        {
          domain: 'surface',
          selectedSurfaceFill: { familyId: 'water', variantId: 'shallow' },
          activeRegionId: null,
          pendingRegionColorKey: pending,
        },
        sampleRegions,
      ),
    ).toBe(true);
    expect(
      canApplyAnyPaintStroke(
        {
          domain: 'region',
          selectedSurfaceFill: null,
          activeRegionId: 'r1',
          pendingRegionColorKey: pending,
        },
        sampleRegions,
      ),
    ).toBe(true);
  });

  it('resolveActiveRegionEntry returns null when id missing or unknown', () => {
    expect(resolveActiveRegionEntry(sampleRegions, null)).toBeNull();
    expect(resolveActiveRegionEntry(sampleRegions, 'x')).toBeNull();
    expect(resolveActiveRegionEntry(sampleRegions, 'r1')?.id).toBe('r1');
  });
});
