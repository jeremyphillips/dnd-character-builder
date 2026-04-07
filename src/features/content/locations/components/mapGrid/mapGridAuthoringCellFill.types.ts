/**
 * Resolved **paint** for a map cell (swatch + optional image). Chrome policy stays in
 * {@link resolveAuthoringGridChrome}; image URLs are resolved by callers, not the chrome resolver.
 */
export type AuthoringCellFillPresentation = {
  /** Opaque swatch color (terrain / floor). */
  swatchColor: string;
  /** Optional texture; same fill-opacity rules apply to swatch + image together. */
  imageUrl?: string | undefined;
};
