// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  canApplySurfaceTerrainPaint,
  createInitialPaintState,
  ensureRegionDraftTarget,
  getActiveSurfaceFillKind,
} from './locationMapPaintSelection.helpers';
import type { LocationMapPaintState } from './locationMapEditor.types';

describe('locationMapPaintSelection.helpers', () => {
  it('createInitialPaintState is surface domain with empty selections', () => {
    const s = createInitialPaintState();
    expect(s.domain).toBe('surface');
    expect(s.surfaceFillKind).toBeNull();
    expect(s.activeRegionDraftId).toBeNull();
    expect(s.activeRegionColorKey).toBeNull();
    expect(s.regionLabel).toBe('Untitled Region');
  });

  it('getActiveSurfaceFillKind returns fill only in surface domain', () => {
    expect(getActiveSurfaceFillKind(null)).toBeNull();
    const surface: LocationMapPaintState = {
      domain: 'surface',
      surfaceFillKind: 'cellFillPlains',
      activeRegionColorKey: null,
      activeRegionDraftId: null,
      regionLabel: 'Untitled Region',
    };
    expect(getActiveSurfaceFillKind(surface)).toBe('cellFillPlains');
    const region: LocationMapPaintState = {
      ...surface,
      domain: 'region',
      activeRegionColorKey: 'regionRed',
      activeRegionDraftId: 'draft-1',
    };
    expect(getActiveSurfaceFillKind(region)).toBeNull();
  });

  it('canApplySurfaceTerrainPaint requires surface domain and non-null fill', () => {
    const emptySurface: LocationMapPaintState = {
      domain: 'surface',
      surfaceFillKind: null,
      activeRegionColorKey: null,
      activeRegionDraftId: null,
      regionLabel: 'Untitled Region',
    };
    expect(canApplySurfaceTerrainPaint(emptySurface)).toBe(false);
    expect(
      canApplySurfaceTerrainPaint({
        ...emptySurface,
        surfaceFillKind: 'cellFillWater',
      }),
    ).toBe(true);
  });

  it('ensureRegionDraftTarget assigns id and default color', () => {
    const base = createInitialPaintState();
    const next = ensureRegionDraftTarget(base, () => 'fixed-id');
    expect(next.domain).toBe('region');
    expect(next.activeRegionDraftId).toBe('fixed-id');
    expect(next.activeRegionColorKey).toBe('regionRed');
  });

  it('ensureRegionDraftTarget preserves existing draft id and color', () => {
    const base: LocationMapPaintState = {
      ...createInitialPaintState(),
      activeRegionDraftId: 'keep-me',
      activeRegionColorKey: 'regionBlue',
    };
    const next = ensureRegionDraftTarget(base, () => 'should-not-use');
    expect(next.activeRegionDraftId).toBe('keep-me');
    expect(next.activeRegionColorKey).toBe('regionBlue');
  });
});
