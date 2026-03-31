// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { removePathChainSegment } from '../locationMapPathAuthoring.helpers';

describe('removePathChainSegment', () => {
  const id = () => 'new-id';

  it('splits a four-cell chain when removing a middle segment', () => {
    const out = removePathChainSegment(
      [{ id: 'p1', kind: 'road', cellIds: ['0,0', '1,0', '2,0', '3,0'] }],
      'p1',
      '1,0',
      '2,0',
      id,
    );
    expect(out).toHaveLength(2);
    expect(out.map((e) => e.cellIds)).toEqual([
      ['0,0', '1,0'],
      ['2,0', '3,0'],
    ]);
  });

  it('drops degenerate single-cell remainder', () => {
    const out = removePathChainSegment(
      [{ id: 'p1', kind: 'road', cellIds: ['0,0', '1,0'] }],
      'p1',
      '0,0',
      '1,0',
      id,
    );
    expect(out).toHaveLength(0);
  });
});
