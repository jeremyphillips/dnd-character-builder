/**
 * Pure resolution of authoring grid cell **chrome colors** (border + terrain fill).
 * Policy mirrors {@link mapGridCellVisualState}; geometry stays in the builder.
 */
import { alpha } from '@mui/material/styles';

import type { LocationMapSelection } from '@/features/content/locations/components/workspace/rightRail/types';

import {
  GRID_CELL_BORDER_COLOR,
  GRID_CELL_BORDER_COLOR_HOVER,
  gridCellPalette,
} from './gridCellStyles';

export type AuthoringGridChromeColors = {
  border: string;
  fill: string;
};

export type AuthoringGridChrome = {
  /** Idle border + fill (non-hover). */
  idle: AuthoringGridChromeColors;
  /** On `:hover` when select-mode hover is suppressed for this cell — same as idle. */
  hoverSuppressed: AuthoringGridChromeColors;
  /** On `:hover` when this cell is the hover winner — terrain-tinted fill at hover opacity. */
  hoverEmphasis: AuthoringGridChromeColors;
};

export type AuthoringGridChromeInput = {
  selected: boolean;
  excluded: boolean;
  fillBg: string | undefined;
};

/**
 * Resolves border/fill for idle, hover-suppressed (mirror idle), and hover-emphasis states.
 * `fillBg` is the terrain tint; falls back to {@link gridCellPalette.background.default}.
 */
export function resolveAuthoringGridChrome(
  input: AuthoringGridChromeInput,
): AuthoringGridChrome {
  const fillBgColor = input.fillBg ?? gridCellPalette.background.default;
  const { selected, excluded } = input;

  const idleBorder = selected
    ? gridCellPalette.border.selected
    : excluded
      ? gridCellPalette.border.excluded
      : GRID_CELL_BORDER_COLOR;

  const idleFill = selected
    ? alpha(fillBgColor, gridCellPalette.background.fillOpacity.selected)
    : excluded
      ? gridCellPalette.background.excluded
      : fillBgColor;

  const idle: AuthoringGridChromeColors = { border: idleBorder, fill: idleFill };

  const hoverEmphasisBorder = selected
    ? gridCellPalette.border.selected
    : GRID_CELL_BORDER_COLOR_HOVER;

  const hoverEmphasisFill = excluded
    ? gridCellPalette.background.excluded
    : alpha(fillBgColor, gridCellPalette.background.fillOpacity.hover);

  return {
    idle,
    hoverSuppressed: idle,
    hoverEmphasis: {
      border: hoverEmphasisBorder,
      fill: hoverEmphasisFill,
    },
  };
}
