// @vitest-environment node
import { describe, expect, it } from 'vitest';

import type { LocationMapPathAuthoringEntry } from '@/shared/domain/locations/map/locationMap.types';

import {
  chainToSmoothSvgPath,
  pathEntriesToSvgPaths,
  polylinePoint2DToSmoothSvgPath,
} from './pathOverlayRendering';

function pathEntry(id: string, kind: 'road' | 'river', cellIds: string[]): LocationMapPathAuthoringEntry {
  return { id, kind, cellIds };
}

describe('chainToSmoothSvgPath', () => {
  it('returns empty string for fewer than 2 points', () => {
    expect(chainToSmoothSvgPath([])).toBe('');
    expect(chainToSmoothSvgPath([{ cx: 0, cy: 0 }])).toBe('');
  });

  it('produces a straight line M...L for 2 points', () => {
    const d = chainToSmoothSvgPath([{ cx: 0, cy: 0 }, { cx: 100, cy: 50 }]);
    expect(d).toMatch(/^M/);
    expect(d).toMatch(/L/);
    expect(d).not.toMatch(/C/);
  });

  it('produces smooth cubic bezier C commands for 3+ points', () => {
    const d = chainToSmoothSvgPath([
      { cx: 0, cy: 0 },
      { cx: 50, cy: 30 },
      { cx: 100, cy: 0 },
    ]);
    expect(d).toMatch(/^M/);
    expect(d).toMatch(/C/);
  });

  it('produces multiple C commands for 4+ points', () => {
    const d = chainToSmoothSvgPath([
      { cx: 0, cy: 0 },
      { cx: 50, cy: 30 },
      { cx: 100, cy: 0 },
      { cx: 150, cy: 30 },
    ]);
    const cCount = (d.match(/C/g) ?? []).length;
    expect(cCount).toBeGreaterThanOrEqual(3);
  });
});

describe('polylinePoint2DToSmoothSvgPath', () => {
  it('matches chainToSmoothSvgPath for equivalent points', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 100, y: 50 },
    ];
    const a = polylinePoint2DToSmoothSvgPath(pts);
    const b = chainToSmoothSvgPath([
      { cx: 0, cy: 0 },
      { cx: 100, cy: 50 },
    ]);
    expect(a).toBe(b);
  });
});

describe('pathEntriesToSvgPaths', () => {
  const centerFn = (cellId: string) => {
    const [x, y] = cellId.split(',').map(Number);
    return { cx: x * 50, cy: y * 50 };
  };

  it('returns empty for no path entries', () => {
    expect(pathEntriesToSvgPaths([], centerFn)).toEqual([]);
  });

  it('produces one svg path per authored chain', () => {
    const paths = pathEntriesToSvgPaths(
      [pathEntry('a', 'road', ['0,0', '1,0', '2,0'])],
      centerFn,
    );
    expect(paths).toHaveLength(1);
    expect(paths[0].kind).toBe('road');
    expect(paths[0].d).toMatch(/^M/);
  });

  it('uses smooth curves for chains of 3+ cells', () => {
    const paths = pathEntriesToSvgPaths(
      [pathEntry('a', 'road', ['0,0', '1,0', '2,0'])],
      centerFn,
    );
    expect(paths[0].d).toMatch(/C/);
  });
});
