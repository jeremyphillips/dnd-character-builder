// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  buildHexAuthoringCellVisualParts,
  buildSquareAuthoringCellVisualParts,
} from '../mapGridAuthoringCellVisual.builder';

describe('buildSquareAuthoringCellVisualParts', () => {
  it('uses selected border and inset shadow when selected', () => {
    const { shell } = buildSquareAuthoringCellVisualParts({
      cellId: '0,0',
      selected: true,
      excluded: false,
      fillPresentation: { swatchColor: '#abc' },
      disabled: false,
      selectHoverTarget: undefined,
    });
    expect(shell.borderColor).toBeDefined();
    expect(shell.boxShadow).toMatch(/inset/);
  });

  it('uses excluded styling when excluded and not selected', () => {
    const { shell, fillLayer } = buildSquareAuthoringCellVisualParts({
      cellId: '0,0',
      selected: false,
      excluded: true,
      fillPresentation: undefined,
      disabled: false,
      selectHoverTarget: undefined,
    });
    expect(shell.borderStyle).toBe('dashed');
    expect(fillLayer.backgroundImage).toMatch(/repeating-linear-gradient/);
  });

  it('mirrors idle chrome on hover when select hover is suppressed for this cell', () => {
    const { shell } = buildSquareAuthoringCellVisualParts({
      cellId: '1,0',
      selected: false,
      excluded: false,
      fillPresentation: undefined,
      disabled: false,
      selectHoverTarget: { type: 'cell', cellId: '0,0' },
    });
    const hover = shell['&:hover'] as Record<string, unknown> | undefined;
    expect(hover).toBeDefined();
    expect(hover?.borderColor).toBeDefined();
  });
});

describe('buildHexAuthoringCellVisualParts', () => {
  it('returns outer, inner shell, fill layer, and host hover sx keys for a typical cell', () => {
    const parts = buildHexAuthoringCellVisualParts({
      cellId: '0,0',
      selected: false,
      excluded: false,
      fillPresentation: undefined,
      disabled: false,
      selectHoverTarget: undefined,
      strokePx: '1px',
    });
    expect(parts.outer.bgcolor).toBeDefined();
    expect(parts.innerShell.clipPath).toMatch(/polygon/);
    expect(parts.fillLayer).toBeDefined();
    expect(parts.hostHoverSx).toBeDefined();
  });
});
