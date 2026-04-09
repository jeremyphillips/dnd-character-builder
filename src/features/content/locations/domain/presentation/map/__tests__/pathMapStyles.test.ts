// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  PATH_WIDTH_FALLBACK_PX,
  pathStrokeForKind,
  pathWidthsForHostScale,
} from '../pathMapStyles';

describe('pathMapStyles', () => {
  it('resolves stroke by road vs river', () => {
    expect(pathStrokeForKind('river')).not.toBe(pathStrokeForKind('road'));
  });

  it('falls back stroke to road for unknown kind', () => {
    expect(pathStrokeForKind('unknown')).toBe(pathStrokeForKind('road'));
  });

  it('resolves width by world vs city host scale', () => {
    expect(pathWidthsForHostScale('world').default).toBeGreaterThan(pathWidthsForHostScale('city').default);
    expect(pathWidthsForHostScale('city').selected).toBeLessThan(pathWidthsForHostScale('world').selected);
  });

  it('uses fallback width for unknown scale', () => {
    expect(pathWidthsForHostScale('')).toEqual(PATH_WIDTH_FALLBACK_PX);
    expect(pathWidthsForHostScale('floor')).toEqual(PATH_WIDTH_FALLBACK_PX);
  });
});
