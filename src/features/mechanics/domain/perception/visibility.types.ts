import type { LightingLevel, ObscuredLevel } from '../environment/environment.types'

/**
 * Inputs to visibility resolution — baseline environment, effects, or hidden state.
 * Used to build {@link ResolvedCellVisibility}; not stored on encounter state.
 */
export type VisibilityContributor =
  | { kind: 'lighting'; level: LightingLevel; source: 'environment' | 'effect' }
  | {
      kind: 'obscuration'
      level: Exclude<ObscuredLevel, 'none'>
      cause:
        | 'environment'
        | 'fog'
        | 'smoke'
        | 'dust'
        | 'darkness'
        | 'magical-darkness'
    }
  | { kind: 'hidden'; cause: 'unrevealed' }

/**
 * Semantic visibility at a cell after merging contributors (lighting and obscuration stay separate).
 */
export type VisibilityPrimaryCause =
  | 'environment'
  | 'fog'
  | 'smoke'
  | 'dust'
  | 'darkness'
  | 'magical-darkness'
  | 'unrevealed'

export type ResolvedCellVisibility = {
  lighting: LightingLevel
  obscured: ObscuredLevel
  primaryCause?: VisibilityPrimaryCause
  hidden: boolean
}

/**
 * Grid / UI tint ids — mapped from {@link ResolvedCellVisibility} by presentation layer only.
 */
export type VisibilityFillKind = 'dim' | 'fog' | 'darkness' | 'magical-darkness' | 'hidden'
