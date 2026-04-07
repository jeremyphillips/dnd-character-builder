// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { resolveCellFillPresentation } from './cellFillPresentation.resolve';

describe('resolveCellFillPresentation', () => {
  it('returns swatch and imageUrl for floor stone', () => {
    const p = resolveCellFillPresentation('floor', 'stone');
    expect(p.swatchColor).toMatch(/^#/);
    expect(p.imageUrl).toBe('/assets/system/locations/fills/floor-stone.png');
  });

  it('returns swatch only for terrain without imageKey', () => {
    const p = resolveCellFillPresentation('plains', 'temperate_open');
    expect(p.swatchColor).toMatch(/^#/);
    expect(p.imageUrl).toBeUndefined();
  });

  it('uses default variant when variant id is invalid', () => {
    const p = resolveCellFillPresentation('floor', 'nonexistent');
    expect(p.swatchColor).toBeDefined();
    expect(p.imageUrl).toBe('/assets/system/locations/fills/floor-stone.png');
  });
});
