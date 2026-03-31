// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  edgeEntriesToSegmentGeometrySquare,
  edgeEntryToSegmentGeometrySquare,
} from '../locationMapEdgeGeometry.helpers';

describe('edgeEntryToSegmentGeometrySquare', () => {
  const cellPx = 40;

  it('returns segment for canonical between edge id', () => {
    const g = edgeEntryToSegmentGeometrySquare(
      { edgeId: 'between:0,0|1,0', kind: 'wall' },
      cellPx,
    );
    expect(g).not.toBeNull();
    expect(g!.edgeId).toBe('between:0,0|1,0');
    expect(g!.kind).toBe('wall');
    expect(g!.segment.x1).toBe(g!.segment.x2);
    expect(g!.segment.y1).not.toBe(g!.segment.y2);
  });

  it('returns null for invalid edge id', () => {
    expect(edgeEntryToSegmentGeometrySquare({ edgeId: 'bad', kind: 'wall' }, cellPx)).toBeNull();
  });
});

describe('edgeEntriesToSegmentGeometrySquare', () => {
  it('maps all entries', () => {
    const rows = edgeEntriesToSegmentGeometrySquare(
      [
        { edgeId: 'between:0,0|0,1', kind: 'window' },
        { edgeId: 'between:1,0|1,1', kind: 'door' },
      ],
      40,
    );
    expect(rows).toHaveLength(2);
    expect(rows[0].kind).toBe('window');
    expect(rows[1].kind).toBe('door');
  });
});
