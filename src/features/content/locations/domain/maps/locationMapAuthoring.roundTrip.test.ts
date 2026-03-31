import { describe, expect, it } from 'vitest';

import {
  edgeEntriesToSegmentGeometrySquare,
  normalizeLocationMapAuthoringFields,
  pathEntriesToPolylineGeometry,
} from '@/shared/domain/locations';

import { cellDraftToCellEntries, cellEntriesToDraft } from './cellAuthoringMappers';

/**
 * Regression: authored map content must survive load → draft → save-shaped payload without
 * losing pathEntries, edgeEntries, or cellEntries (no silent omission of arrays).
 */
describe('location map authoring round-trip (draft ↔ persisted shape)', () => {
  const representative = normalizeLocationMapAuthoringFields({
    cellEntries: [
      {
        cellId: '0,0',
        linkedLocationId: 'child-loc-1',
        cellFillKind: 'water',
        objects: [{ id: 'o1', kind: 'landmark', label: 'Well' }],
      },
    ],
    pathEntries: [
      { id: 'chain-road', kind: 'road', cellIds: ['0,0', '1,0', '2,0'] },
      { id: 'chain-river', kind: 'river', cellIds: ['0,1', '1,1'] },
    ],
    edgeEntries: [
      { edgeId: 'between:0,0|0,1', kind: 'wall' },
      { edgeId: 'between:1,0|1,1', kind: 'door' },
    ],
  });

  it('preserves all three collections through normalize → draft records → cellDraftToCellEntries + path/edge passthrough → normalize', () => {
    const afterLoad = normalizeLocationMapAuthoringFields({
      cellEntries: representative.cellEntries,
      pathEntries: undefined,
      edgeEntries: undefined,
    });
    expect(afterLoad.pathEntries).toEqual([]);
    expect(afterLoad.edgeEntries).toEqual([]);

    const fullLoad = normalizeLocationMapAuthoringFields({
      cellEntries: representative.cellEntries,
      pathEntries: representative.pathEntries,
      edgeEntries: representative.edgeEntries,
    });

    const draft = {
      ...cellEntriesToDraft(fullLoad.cellEntries),
      pathEntries: fullLoad.pathEntries,
      edgeEntries: fullLoad.edgeEntries,
    };

    const saveShaped = normalizeLocationMapAuthoringFields({
      cellEntries: cellDraftToCellEntries(
        draft.linkedLocationByCellId,
        draft.objectsByCellId,
        draft.cellFillByCellId,
      ),
      pathEntries: draft.pathEntries,
      edgeEntries: draft.edgeEntries,
    });

    expect(saveShaped.cellEntries).toEqual(representative.cellEntries);
    expect(saveShaped.pathEntries).toEqual(representative.pathEntries);
    expect(saveShaped.edgeEntries).toEqual(representative.edgeEntries);
  });

  it('path and edge derived geometry matches before and after the authored round-trip', () => {
    const draft = {
      ...cellEntriesToDraft(representative.cellEntries),
      pathEntries: representative.pathEntries,
      edgeEntries: representative.edgeEntries,
    };
    const roundTrip = normalizeLocationMapAuthoringFields({
      cellEntries: cellDraftToCellEntries(
        draft.linkedLocationByCellId,
        draft.objectsByCellId,
        draft.cellFillByCellId,
      ),
      pathEntries: draft.pathEntries,
      edgeEntries: draft.edgeEntries,
    });

    const centers = new Map([
      ['0,0', { cx: 10, cy: 20 }],
      ['1,0', { cx: 30, cy: 20 }],
      ['2,0', { cx: 50, cy: 20 }],
      ['0,1', { cx: 10, cy: 40 }],
      ['1,1', { cx: 30, cy: 40 }],
    ]);
    const centerFn = (id: string) => centers.get(id) ?? null;

    const polyBefore = pathEntriesToPolylineGeometry(representative.pathEntries, centerFn);
    const polyAfter = pathEntriesToPolylineGeometry(roundTrip.pathEntries, centerFn);
    expect(polyAfter).toEqual(polyBefore);

    const cellPx = 40;
    const edgeBefore = edgeEntriesToSegmentGeometrySquare(representative.edgeEntries, cellPx);
    const edgeAfter = edgeEntriesToSegmentGeometrySquare(roundTrip.edgeEntries, cellPx);
    expect(edgeAfter).toEqual(edgeBefore);
  });
});
