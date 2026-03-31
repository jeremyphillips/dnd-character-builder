// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { validatePathSegmentsStructure } from '../locationMapFeatures.validation';

describe('validatePathSegmentsStructure — hex geometry', () => {
  const width = 6;
  const height = 6;

  it('accepts hex-adjacent path segment (even col east neighbor)', () => {
    const errors = validatePathSegmentsStructure(
      [{ id: '1', kind: 'road', startCellId: '0,0', endCellId: '1,0' }],
      width, height, 'hex',
    );
    const adjErrors = errors.filter((e) => e.code === 'INVALID');
    expect(adjErrors).toHaveLength(0);
  });

  it('accepts hex-adjacent path segment (even col south neighbor)', () => {
    const errors = validatePathSegmentsStructure(
      [{ id: '1', kind: 'road', startCellId: '0,0', endCellId: '0,1' }],
      width, height, 'hex',
    );
    expect(errors.filter((e) => e.code === 'INVALID')).toHaveLength(0);
  });

  it('accepts hex-adjacent path segment (odd col SE neighbor)', () => {
    const errors = validatePathSegmentsStructure(
      [{ id: '1', kind: 'road', startCellId: '1,0', endCellId: '2,1' }],
      width, height, 'hex',
    );
    expect(errors.filter((e) => e.code === 'INVALID')).toHaveLength(0);
  });

  it('rejects non-adjacent hex cells', () => {
    const errors = validatePathSegmentsStructure(
      [{ id: '1', kind: 'road', startCellId: '0,0', endCellId: '3,3' }],
      width, height, 'hex',
    );
    const adjErrors = errors.filter((e) => e.code === 'INVALID');
    expect(adjErrors.length).toBeGreaterThan(0);
  });

  it('rejects diagonal on hex that is not a hex neighbor', () => {
    const errors = validatePathSegmentsStructure(
      [{ id: '1', kind: 'road', startCellId: '0,0', endCellId: '1,1' }],
      width, height, 'hex',
    );
    const adjErrors = errors.filter((e) => e.code === 'INVALID');
    expect(adjErrors.length).toBeGreaterThan(0);
  });

  it('square geometry still works via default', () => {
    const errors = validatePathSegmentsStructure(
      [{ id: '1', kind: 'road', startCellId: '0,0', endCellId: '1,0' }],
      width, height,
    );
    expect(errors.filter((e) => e.code === 'INVALID')).toHaveLength(0);
  });

  it('square geometry rejects diagonal', () => {
    const errors = validatePathSegmentsStructure(
      [{ id: '1', kind: 'road', startCellId: '0,0', endCellId: '1,1' }],
      width, height, 'square',
    );
    expect(errors.filter((e) => e.code === 'INVALID').length).toBeGreaterThan(0);
  });
});
