// @vitest-environment node
import { describe, expect, it } from 'vitest';

import type { LocationMapPathSegment } from '@/shared/domain/locations/map/locationMap.types';

import {
  buildPathChains,
  chainToSmoothSvgPath,
  pathSegmentsToSvgPaths,
} from './pathOverlayRendering';

function seg(id: string, kind: 'road' | 'river', start: string, end: string): LocationMapPathSegment {
  return { id, kind, startCellId: start, endCellId: end };
}

describe('buildPathChains', () => {
  it('returns empty for no segments', () => {
    expect(buildPathChains([])).toEqual([]);
  });

  it('builds a single two-cell chain from one segment', () => {
    const chains = buildPathChains([seg('1', 'road', '0,0', '1,0')]);
    expect(chains).toHaveLength(1);
    expect(chains[0].kind).toBe('road');
    expect(chains[0].cells).toHaveLength(2);
    expect(chains[0].cells).toContain('0,0');
    expect(chains[0].cells).toContain('1,0');
  });

  it('builds a three-cell chain from two connected segments', () => {
    const chains = buildPathChains([
      seg('1', 'road', '0,0', '1,0'),
      seg('2', 'road', '1,0', '2,0'),
    ]);
    expect(chains).toHaveLength(1);
    expect(chains[0].cells).toHaveLength(3);
  });

  it('separates chains by kind', () => {
    const chains = buildPathChains([
      seg('1', 'road', '0,0', '1,0'),
      seg('2', 'river', '3,0', '4,0'),
    ]);
    expect(chains).toHaveLength(2);
    const kinds = chains.map((c) => c.kind).sort();
    expect(kinds).toEqual(['river', 'road']);
  });

  it('splits at branch points (degree > 2)', () => {
    const chains = buildPathChains([
      seg('1', 'road', '0,0', '1,0'),
      seg('2', 'road', '1,0', '2,0'),
      seg('3', 'road', '1,0', '1,1'),
    ]);
    expect(chains.length).toBeGreaterThanOrEqual(2);
    const allCells = chains.flatMap((c) => c.cells);
    expect(allCells).toContain('0,0');
    expect(allCells).toContain('2,0');
    expect(allCells).toContain('1,1');
  });

  it('filters by kind when kindFilter is specified', () => {
    const chains = buildPathChains(
      [seg('1', 'road', '0,0', '1,0'), seg('2', 'river', '3,0', '4,0')],
      'road',
    );
    expect(chains).toHaveLength(1);
    expect(chains[0].kind).toBe('road');
  });
});

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

describe('pathSegmentsToSvgPaths', () => {
  const centerFn = (cellId: string) => {
    const [x, y] = cellId.split(',').map(Number);
    return { cx: x * 50, cy: y * 50 };
  };

  it('returns empty for no segments', () => {
    expect(pathSegmentsToSvgPaths([], centerFn)).toEqual([]);
  });

  it('produces one svg path per chain', () => {
    const paths = pathSegmentsToSvgPaths(
      [seg('1', 'road', '0,0', '1,0'), seg('2', 'road', '1,0', '2,0')],
      centerFn,
    );
    expect(paths).toHaveLength(1);
    expect(paths[0].kind).toBe('road');
    expect(paths[0].d).toMatch(/^M/);
  });

  it('uses smooth curves for chains of 3+ cells', () => {
    const paths = pathSegmentsToSvgPaths(
      [
        seg('1', 'road', '0,0', '1,0'),
        seg('2', 'road', '1,0', '2,0'),
      ],
      centerFn,
    );
    expect(paths[0].d).toMatch(/C/);
  });
});
