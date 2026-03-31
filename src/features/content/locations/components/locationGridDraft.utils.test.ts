import { describe, expect, it } from 'vitest';

import { INITIAL_LOCATION_GRID_DRAFT } from './locationGridDraft.types';
import { gridDraftPersistableEquals, normalizePersistableCellMaps } from './locationGridDraft.utils';

describe('gridDraftPersistableEquals', () => {
  it('treats empty object label like omitted label (server round-trip)', () => {
    const fromServer = {
      ...INITIAL_LOCATION_GRID_DRAFT,
      objectsByCellId: {
        'cell-0-0': [{ id: 'a', kind: 'marker' as const }],
      },
    };
    const fromUi = {
      ...INITIAL_LOCATION_GRID_DRAFT,
      objectsByCellId: {
        'cell-0-0': [{ id: 'a', kind: 'marker' as const, label: '' }],
      },
    };
    expect(normalizePersistableCellMaps(fromServer)).toEqual(
      normalizePersistableCellMaps(fromUi),
    );
    expect(gridDraftPersistableEquals(fromServer, fromUi)).toBe(true);
  });

  it('is false after removing the last cell object', () => {
    const baseline = {
      ...INITIAL_LOCATION_GRID_DRAFT,
      objectsByCellId: {
        'cell-0-0': [{ id: 'a', kind: 'marker' as const }],
      },
    };
    const afterRemove = {
      ...INITIAL_LOCATION_GRID_DRAFT,
      objectsByCellId: {},
    };
    expect(gridDraftPersistableEquals(baseline, afterRemove)).toBe(false);
  });
});
