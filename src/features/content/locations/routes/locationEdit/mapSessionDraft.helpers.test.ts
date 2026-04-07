import { describe, expect, it } from 'vitest';

import { INITIAL_LOCATION_GRID_DRAFT } from '@/features/content/locations/components/authoring/draft/locationGridDraft.types';

import {
  applyDeleteForMapSelection,
  applyRemoveRegionFromDraft,
} from './mapSessionDraft.helpers';

describe('applyRemoveRegionFromDraft', () => {
  it('removes region entry and clears all cells painted with that id', () => {
    const prev = {
      ...INITIAL_LOCATION_GRID_DRAFT,
      regionEntries: [
        { id: 'r1', name: 'A', colorKey: 'regionRed' as const },
        { id: 'r2', name: 'B', colorKey: 'regionBlue' as const },
      ],
      regionIdByCellId: { '0,0': 'r1', '1,0': 'r1', '2,0': 'r2' },
    };
    const next = applyRemoveRegionFromDraft(prev, 'r1');
    expect(next.regionEntries.map((r) => r.id)).toEqual(['r2']);
    expect(next.regionIdByCellId).toEqual({ '2,0': 'r2' });
  });

  it('clears map selection when the removed region is selected', () => {
    const prev = {
      ...INITIAL_LOCATION_GRID_DRAFT,
      mapSelection: { type: 'region' as const, regionId: 'r1' },
      selectedCellId: '0,0' as string | null,
      regionEntries: [{ id: 'r1', name: 'A', colorKey: 'regionRed' as const }],
      regionIdByCellId: { '0,0': 'r1' },
    };
    const next = applyRemoveRegionFromDraft(prev, 'r1');
    expect(next.mapSelection).toEqual({ type: 'none' });
    expect(next.selectedCellId).toBeNull();
  });

  it('keeps selection when another region is selected', () => {
    const prev = {
      ...INITIAL_LOCATION_GRID_DRAFT,
      mapSelection: { type: 'region' as const, regionId: 'r2' },
      regionEntries: [
        { id: 'r1', name: 'A', colorKey: 'regionRed' as const },
        { id: 'r2', name: 'B', colorKey: 'regionBlue' as const },
      ],
      regionIdByCellId: {},
    };
    const next = applyRemoveRegionFromDraft(prev, 'r1');
    expect(next.mapSelection).toEqual({ type: 'region', regionId: 'r2' });
  });
});

describe('applyDeleteForMapSelection', () => {
  it('removes region when map selection is region', () => {
    const prev = {
      ...INITIAL_LOCATION_GRID_DRAFT,
      mapSelection: { type: 'region' as const, regionId: 'r1' },
      regionEntries: [{ id: 'r1', name: 'A', colorKey: 'regionRed' as const }],
      regionIdByCellId: { '0,0': 'r1' },
    };
    const next = applyDeleteForMapSelection(prev);
    expect(next).not.toBeNull();
    expect(next!.regionEntries).toEqual([]);
    expect(next!.regionIdByCellId).toEqual({});
    expect(next!.mapSelection).toEqual({ type: 'none' });
  });
});
