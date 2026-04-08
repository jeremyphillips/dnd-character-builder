import type { LocationMapCellFillSelection } from '@/shared/domain/locations';
import {
  getAuthoredCellFillFamilyDefinition,
  resolveCellFillVariant,
} from '@/shared/domain/locations/map/authoredCellFillDefinitions';

import {
  cellFillCategoryToSectionLabel,
  cellFillPresentationRowsFromPresentation,
  formatCellPlacementLine,
} from '../selectionRail.helpers';

import type { SelectionRailViewModel } from './selectionRailViewModel.types';

/** Resolved display model for the Selection tab cell-fill inspector (shared rail template). */
export function buildCellFillSelectionRailViewModel(
  cellId: string,
  fill: LocationMapCellFillSelection,
): SelectionRailViewModel {
  const family = getAuthoredCellFillFamilyDefinition(fill.familyId);
  const resolved = resolveCellFillVariant(fill.familyId, fill.variantId);
  return {
    categoryLabel: cellFillCategoryToSectionLabel(family.category),
    title: resolved.variant.label,
    placementLine: formatCellPlacementLine(cellId),
    metadataRows: cellFillPresentationRowsFromPresentation(resolved.variant.presentation),
  };
}
