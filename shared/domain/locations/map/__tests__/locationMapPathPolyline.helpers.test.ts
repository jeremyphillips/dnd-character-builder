// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  pathEntriesToPolylineGeometry,
  pathEntryToPolylineGeometry,
} from '../locationMapPathPolyline.helpers';

describe('pathEntryToPolylineGeometry', () => {
  const centerFn = (cellId: string) => {
    const [x, y] = cellId.split(',').map(Number);
    return { cx: x * 10, cy: y * 10 };
  };

  it('returns null for fewer than two resolved centers', () => {
    expect(
      pathEntryToPolylineGeometry({ id: 'a', kind: 'road', cellIds: ['0,0'] }, centerFn),
    ).toBeNull();
  });

  it('returns Point2D polyline from centerline seam', () => {
    const g = pathEntryToPolylineGeometry(
      { id: 'a', kind: 'river', cellIds: ['0,0', '1,0'] },
      centerFn,
    );
    expect(g).toEqual({
      id: 'a',
      kind: 'river',
      points: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ],
    });
  });
});

describe('pathEntriesToPolylineGeometry', () => {
  const centerFn = (cellId: string) => {
    const [x, y] = cellId.split(',').map(Number);
    return { cx: x * 10, cy: y * 10 };
  };

  it('returns multiple polylines in entry order', () => {
    const rows = pathEntriesToPolylineGeometry(
      [
        { id: 'a', kind: 'road', cellIds: ['0,0', '1,0'] },
        { id: 'b', kind: 'river', cellIds: ['2,0', '3,0'] },
      ],
      centerFn,
    );
    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe('a');
    expect(rows[1].id).toBe('b');
  });
});
