/**
 * Pure resolution of authoring grid cell **chrome** (border + fill layer opacity + opaque paint color).
 * Policy mirrors {@link mapGridCellVisualState}; geometry stays in the builder.
 * Fill **presentation** (swatch + optional image) is separate — callers pass opaque `fillBg` here.
 */
import {
  GRID_CELL_BORDER_COLOR,
  GRID_CELL_BORDER_COLOR_HOVER,
  gridCellPalette,
} from './gridCellStyles';

export type AuthoringGridChromeLayer = {
  border: string;
  /** Opacity for the whole fill layer (swatch + optional `backgroundImage`). */
  fillOpacity: number;
  /** Opaque tint; excluded cells use {@link gridCellPalette.background.excluded} at full opacity. */
  fillPaintColor: string;
};

export type AuthoringGridChrome = {
  idle: AuthoringGridChromeLayer;
  hoverSuppressed: AuthoringGridChromeLayer;
  hoverEmphasis: AuthoringGridChromeLayer;
};

export type AuthoringGridChromeInput = {
  selected: boolean;
  excluded: boolean;
  /** Opaque terrain swatch; falls back to {@link gridCellPalette.background.default}. */
  fillBg: string | undefined;
};

/**
 * Resolves border + fill-layer opacity + opaque paint for idle, hover-suppressed, hover-emphasis.
 */
export function resolveAuthoringGridChrome(
  input: AuthoringGridChromeInput,
): AuthoringGridChrome {
  const fillBase = input.fillBg ?? gridCellPalette.background.default;
  const { selected, excluded } = input;

  if (excluded) {
    const idleBorder = selected
      ? gridCellPalette.border.selected
      : gridCellPalette.border.excluded;
    const layer: AuthoringGridChromeLayer = {
      border: idleBorder,
      fillOpacity: 1,
      fillPaintColor: gridCellPalette.background.excluded,
    };
    return {
      idle: layer,
      hoverSuppressed: layer,
      hoverEmphasis: {
        border: selected
          ? gridCellPalette.border.selected
          : GRID_CELL_BORDER_COLOR_HOVER,
        fillOpacity: 1,
        fillPaintColor: gridCellPalette.background.excluded,
      },
    };
  }

  const idleBorder = selected
    ? gridCellPalette.border.selected
    : GRID_CELL_BORDER_COLOR;

  const idle: AuthoringGridChromeLayer = {
    border: idleBorder,
    fillPaintColor: fillBase,
    fillOpacity: selected
      ? gridCellPalette.background.fillOpacity.selected
      : 1,
  };

  const hoverEmphasis: AuthoringGridChromeLayer = {
    border: selected
      ? gridCellPalette.border.selected
      : GRID_CELL_BORDER_COLOR_HOVER,
    fillPaintColor: fillBase,
    fillOpacity: gridCellPalette.background.fillOpacity.hover,
  };

  return {
    idle,
    hoverSuppressed: idle,
    hoverEmphasis,
  };
}
