/**
 * Shared grid cell styling tokens for location map `GridEditor` and `HexGridEditor`.
 * Fixed colors from `colorPrimitives` so map chrome does not follow MUI light/dark mode.
 */
import { alpha } from '@mui/material/styles';

import { colorPrimitives } from '@/app/theme/colorPrimitives';
import theme from '@/app/theme';
/** Default grid line between cells. */
export const GRID_CELL_BORDER_COLOR = alpha(colorPrimitives.black, 0.14);

/** Hover ring accent (matches map primary accent). */
export const GRID_CELL_BORDER_COLOR_HOVER = theme.palette.primary.main;

/**
 * Border and background fills for grid cells (hex rings + square buttons).
 */
export const gridCellPalette = {
  border: {
    default: GRID_CELL_BORDER_COLOR,
    excluded: alpha(colorPrimitives.gray[200], 0.45),
    hover: GRID_CELL_BORDER_COLOR_HOVER,
    selected: theme.palette.primary.main,
  },
  background: {
    default: colorPrimitives.gray[100],
    excluded: alpha(colorPrimitives.black, 0.06),
    /** Terrain tint alpha when cell is selected or under hover emphasis (not excluded). */
    fillOpacity: {
      hover: 0.8,
      selected: 0.7,
    },
  },
} as const;

/** Inset ring width when a square cell is selected (`boxShadow`). */
export const gridCellSelectedInsetPx = 2;

export function gridCellSelectedShadow(): string {
  return `inset 0 0 0 ${gridCellSelectedInsetPx}px ${theme.palette.primary.main}`;
}
