/**
 * Shared **fill presentation data** for map cell paints (swatch + optional texture URL).
 * Does not produce `sx` or DOM — authoring and combat compose visuals separately.
 */
import { resolveCellFillSwatchColor } from '@/app/theme/mapColors';
import { resolveImageUrl } from '@/shared/lib/media';

import {
  resolveCellFillVariant,
  type LocationCellFillFamilyId,
} from './authoredCellFillDefinitions';

export type ResolvedCellFillPresentation = {
  swatchColor: string;
  imageUrl?: string;
};

/**
 * Resolves registry variant to opaque swatch + optional image URL (`imageKey` → `resolveImageUrl`).
 */
export function resolveCellFillPresentation(
  familyId: LocationCellFillFamilyId,
  variantId: string | null | undefined,
): ResolvedCellFillPresentation {
  const { variant } = resolveCellFillVariant(familyId, variantId);
  const swatchColor = resolveCellFillSwatchColor(variant);
  const imageUrl = variant.imageKey ? resolveImageUrl(variant.imageKey) : undefined;
  return imageUrl != null ? { swatchColor, imageUrl } : { swatchColor };
}
