import type { Theme } from '@mui/material/styles'
import { alpha, lighten } from '@mui/material/styles'

/**
 * Safe values for MUI `sx` color props with `cssVariables` + `colorSchemes`:
 * - **Palette path strings** (`'background.default'`, `'divider'`, …) track `--mui-palette-*` at runtime.
 * - **Functions** take the **live** `theme` from `sx` when applied — use for `alpha` / `lighten` / `mode`.
 * Do **not** store `theme.palette.*` hex snapshots from a one-off `useTheme()` call.
 */
export type EncounterMuiSxColor = string | ((theme: Theme) => string)

export type EncounterHeaderChrome = {
  default: {
    bgColor: EncounterMuiSxColor
    borderColor: EncounterMuiSxColor
  }
  activeTurn: {
    bgColor: EncounterMuiSxColor
    borderColor: EncounterMuiSxColor
  }
  directive: {
    resourcesExhaustedTextColor: EncounterMuiSxColor
  }
}

/**
 * Semantic encounter UI tokens derived from the active MUI theme.
 */
export type EncounterUiStateTheme = {
  header: {
    /** Sticky header strip height: CSS custom property name + px fallback before it is set. */
    height: {
      layoutFallbackPx: number
      cssVarName: string
    }
    /** Padding and min height for the top chrome (header strip). */
    bar: {
      horizontalSpacing: number
      verticalSpacing: number
      minHeightPx: number
      boxSizing: 'border-box'
    }
    /** Header strip fill / border / directive — safe for color-scheme (see {@link EncounterMuiSxColor}). */
    chrome: EncounterHeaderChrome
  }
}

/**
 * Stable module-level map: same function references across renders so `useMemo` deps behave predictably.
 */
const ENCOUNTER_HEADER_CHROME: EncounterHeaderChrome = {
  default: {
    bgColor: 'background.paper',
    borderColor: 'divider',
  },
  activeTurn: {
    bgColor: (t) =>
      t.palette.mode === 'dark'
        ? lighten(t.palette.background.default, 0.06)
        : alpha(t.palette.primary.main, 0.07),
    borderColor: (t) => alpha(t.palette.primary.main, t.palette.mode === 'dark' ? 0.5 : 0.32),
  },
  directive: {
    resourcesExhaustedTextColor: 'warning.main',
  },
}

/**
 * Layout tokens plus header chrome map. The `theme` argument is reserved for future theme-dependent layout;
 * chrome colors do not snapshot `theme` at call time.
 */
export function getEncounterUiStateTheme(_theme: Theme): EncounterUiStateTheme {
  return {
    header: {
      height: {
        layoutFallbackPx: 104,
        cssVarName: '--encounter-active-header-height',
      },
      bar: {
        horizontalSpacing: 4,
        verticalSpacing: 2,
        minHeightPx: 104,
        boxSizing: 'border-box',
      },
      chrome: ENCOUNTER_HEADER_CHROME,
    },
  }
}
