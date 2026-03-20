/**
 * Shared resolution metadata for authored content (spells, monster actions, traits).
 * See docs/reference/effects.md — note categories, caveats, and resolution status.
 */

/** Canonical categories for `Effect` of kind `note`. */
export type EffectNoteCategory = 'under-modeled' | 'flavor'

/**
 * Qualitative metadata for a content container. Spell-specific fields (e.g. hpThreshold)
 * extend this via intersection in spell.types.
 */
export type ContentResolutionMeta = {
  /** Adapter or geometry limits that structured effects + notes cannot fully capture. */
  caveats?: string[]
  /**
   * Optional discriminator for tooling/audits; most content omits this.
   * Extend with a string union when a stable taxonomy exists.
   */
  subtype?: string
}
