/**
 * Pure state → `sx` for location map authoring grid **cell chrome** (square + hex).
 * Tokens: {@link gridCellPalette}; policy: {@link mapGridCellVisualState}.
 * Shared colors: {@link resolveAuthoringGridChrome}.
 * Host/visual DOM is composed in `GridEditor` / `HexGridEditor`; this module is presentation only.
 */
import type { SystemStyleObject } from '@mui/system';

import { colorPrimitives } from '@/app/theme/colorPrimitives';
import type { LocationMapSelection } from '@/features/content/locations/components/workspace/rightRail/types';

import { gridCellSelectedShadow } from './gridCellStyles';
import { resolveAuthoringGridChrome } from './mapGridAuthoringChrome.resolve';
import {
  isSelectHoverChromeSuppressed,
  shouldApplyCellHoverChrome,
} from './mapGridCellVisualState';

export type SquareAuthoringCellVisualInput = {
  cellId: string;
  selected: boolean;
  excluded: boolean;
  /** Terrain / authored fill under policy (selection + excluded still win in base colors). */
  fillBg: string | undefined;
  disabled: boolean;
  selectHoverTarget: LocationMapSelection | undefined;
};

/**
 * Visible chrome for a **square** authoring cell (border, fill, hover, selected inset shadow).
 * Content centering is {@link GridCellVisual} `centerChildren` (default on); interactive shell stays on {@link GridCellHost}.
 */
export function buildSquareAuthoringCellVisualSx(
  input: SquareAuthoringCellVisualInput,
): SystemStyleObject {
  const {
    cellId,
    selected,
    excluded,
    fillBg,
    disabled,
    selectHoverTarget,
  } = input;

  const selectHoverChromeSuppressed = isSelectHoverChromeSuppressed(
    cellId,
    selectHoverTarget,
    disabled,
  );

  const chrome = resolveAuthoringGridChrome({ selected, excluded, fillBg });
  const baseBorderColor = chrome.idle.border;
  const baseBg = chrome.idle.fill;

  return {
    border: 1,
    borderRadius: 0.5,
    borderColor: baseBorderColor,
    borderStyle: excluded && !selected ? 'dashed' : 'solid',
    bgcolor: baseBg,
    backgroundImage: excluded
      ? 'repeating-linear-gradient(-45deg, rgba(0,0,0,0.04), rgba(0,0,0,0.04) 3px, transparent 3px, transparent 6px)'
      : undefined,
    p: 0.25,
    fontSize: '0.65rem',
    lineHeight: 1.2,
    color: excluded ? 'rgba(0,0,0,0.45)' : colorPrimitives.black,
    boxShadow: selected ? gridCellSelectedShadow() : undefined,
    '&:hover': disabled
      ? undefined
      : selectHoverTarget?.type === 'none'
        ? undefined
        : selectHoverChromeSuppressed
          ? {
              borderColor: chrome.hoverSuppressed.border,
              bgcolor: chrome.hoverSuppressed.fill,
              boxShadow: selected ? gridCellSelectedShadow() : undefined,
            }
          : {
              borderColor: chrome.hoverEmphasis.border,
              bgcolor: chrome.hoverEmphasis.fill,
              boxShadow: selected ? gridCellSelectedShadow() : undefined,
            },
  };
}

export type HexAuthoringCellVisualParts = {
  /** Outer hex ring (clipped); merged into {@link GridCellVisual} for the ring layer. */
  outer: SystemStyleObject;
  /** Inner fill + content area; merged into the inner visual layer. */
  inner: SystemStyleObject;
  /**
   * Hover uses the interactive host as the hover target (see `HexGridEditor` structure).
   * Merge onto {@link GridCellHost} so ring + fill update together.
   */
  hostHoverSx: SystemStyleObject;
};

export type HexAuthoringCellVisualInput = {
  cellId: string;
  selected: boolean;
  excluded: boolean;
  fillBg: string | undefined;
  disabled: boolean;
  selectHoverTarget: LocationMapSelection | undefined;
  strokePx: string;
};

const HEX_OUTER_CLASS = 'grid-cell-visual-hex-outer';
const HEX_INNER_CLASS = 'grid-cell-visual-hex-inner';

/** Class names for hex layers (host hover sx targets these). */
export const hexAuthoringCellVisualClassNames = {
  outer: HEX_OUTER_CLASS,
  inner: HEX_INNER_CLASS,
} as const;

/**
 * Hex authoring chrome split into outer ring + inner fill, plus host-level `:hover` rules.
 */
export function buildHexAuthoringCellVisualParts(
  input: HexAuthoringCellVisualInput,
): HexAuthoringCellVisualParts {
  const {
    cellId,
    selected,
    excluded,
    fillBg,
    disabled,
    selectHoverTarget,
    strokePx,
  } = input;

  const chrome = resolveAuthoringGridChrome({ selected, excluded, fillBg });
  const outerRingColor = chrome.idle.border;
  const innerFillColor = chrome.idle.fill;

  const allowHover = shouldApplyCellHoverChrome(cellId, selectHoverTarget);
  const selectHoverChromeSuppressed = isSelectHoverChromeSuppressed(
    cellId,
    selectHoverTarget,
    disabled,
  );

  const outer: SystemStyleObject = {
    position: 'absolute',
    inset: 0,
    bgcolor: outerRingColor,
    pointerEvents: 'none',
  };

  const inner: SystemStyleObject = {
    position: 'absolute',
    inset: strokePx,
    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    bgcolor: innerFillColor,
    fontSize: '0.6rem',
    lineHeight: 1.2,
    color: excluded ? 'rgba(0,0,0,0.45)' : colorPrimitives.black,
    backgroundImage: excluded
      ? 'repeating-linear-gradient(-45deg, rgba(0,0,0,0.04), rgba(0,0,0,0.04) 3px, transparent 3px, transparent 6px)'
      : undefined,
    pointerEvents: 'auto',
  };

  const hostHoverSx: SystemStyleObject =
    disabled
      ? {}
      : selectHoverTarget?.type === 'none'
        ? {}
        : selectHoverChromeSuppressed
          ? {
              [`&:hover:not(:disabled) .${HEX_OUTER_CLASS}`]: {
                bgcolor: chrome.hoverSuppressed.border,
              },
              [`&:hover:not(:disabled) .${HEX_INNER_CLASS}`]: {
                bgcolor: chrome.hoverSuppressed.fill,
              },
            }
          : allowHover
            ? {
                [`&:hover:not(:disabled) .${HEX_OUTER_CLASS}`]: {
                  bgcolor: chrome.hoverEmphasis.border,
                },
                [`&:hover:not(:disabled) .${HEX_INNER_CLASS}`]: {
                  bgcolor: chrome.hoverEmphasis.fill,
                },
              }
            : {};

  return { outer, inner, hostHoverSx };
}
