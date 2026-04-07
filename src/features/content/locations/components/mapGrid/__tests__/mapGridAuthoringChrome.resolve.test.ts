// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { gridCellPalette } from '../gridCellStyles';
import { resolveAuthoringGridChrome } from '../mapGridAuthoringChrome.resolve';

describe('resolveAuthoringGridChrome', () => {
  it('idle selected uses primary border and terrain at selected fill opacity', () => {
    const c = resolveAuthoringGridChrome({
      selected: true,
      excluded: false,
      fillBg: '#aabbcc',
    });
    expect(c.idle.border).toBe(gridCellPalette.border.selected);
    expect(c.hoverSuppressed).toEqual(c.idle);
    expect(c.idle.fillPaintColor).toBe('#aabbcc');
    expect(c.idle.fillOpacity).toBe(gridCellPalette.background.fillOpacity.selected);
  });

  it('hover emphasis on non-excluded cell uses hover fill opacity', () => {
    const c = resolveAuthoringGridChrome({
      selected: false,
      excluded: false,
      fillBg: '#aabbcc',
    });
    expect(c.hoverEmphasis.fillOpacity).toBe(
      gridCellPalette.background.fillOpacity.hover,
    );
    expect(c.idle.fillOpacity).toBe(1);
    expect(c.idle.fillPaintColor).toBe('#aabbcc');
  });

  it('excluded idle and hover emphasis use excluded fill at full opacity', () => {
    const c = resolveAuthoringGridChrome({
      selected: false,
      excluded: true,
      fillBg: '#eee',
    });
    expect(c.idle.fillPaintColor).toBe(gridCellPalette.background.excluded);
    expect(c.idle.fillOpacity).toBe(1);
    expect(c.hoverEmphasis.fillPaintColor).toBe(gridCellPalette.background.excluded);
  });
});
