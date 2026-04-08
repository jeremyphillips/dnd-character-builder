/**
 * Alias for {@link ResolvedCellFillPresentation} — authoring grid chrome consumes the same fill data
 * as combat underlay; composition stays in `mapGridAuthoringCellVisual.builder`.
 */
export type {
  ResolvedCellFillPresentation,
  ResolvedCellFillPresentation as AuthoringCellFillPresentation,
} from '@/shared/domain/locations/map/cellFillPresentation.resolve';
