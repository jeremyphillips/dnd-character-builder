/**
 * Generic **family + variant** resolution for authored registries shaped as
 * `{ defaultVariantId, variants: Record<string, T> }`.
 *
 * **Registry invariant:** `defaultVariantId` must be a key of `variants`. Callers may rely on it;
 * there is no defensive fallback if the registry is malformed — fix data at the source.
 *
 * **Out of scope:** map wire parsing, legacy family-id mapping, or domain-specific persistence.
 * Future cell-fill family registries (`AUTHORED_CELL_FILL_DEFINITIONS`) should use the same pattern
 * with a thin `resolveCellFillVariant` wrapper, parallel to placed-object `resolvePlacedObjectVariant`.
 */

export type FamilyWithVariants<TVariant> = {
  readonly defaultVariantId: string;
  readonly variants: Readonly<Record<string, TVariant>>;
};

export type ResolvedFamilyVariant<TVariant> = {
  readonly resolvedVariantId: string;
  readonly variant: TVariant;
};

/**
 * If `requestedVariantId` is a key in `family.variants`, returns that variant; otherwise returns
 * `family.defaultVariantId` and its variant row.
 */
export function resolveFamilyVariant<TVariant>(
  family: FamilyWithVariants<TVariant>,
  requestedVariantId: string | null | undefined,
): ResolvedFamilyVariant<TVariant> {
  const resolvedVariantId =
    requestedVariantId != null && requestedVariantId in family.variants
      ? requestedVariantId
      : family.defaultVariantId;
  return {
    resolvedVariantId,
    variant: family.variants[resolvedVariantId]!,
  };
}
