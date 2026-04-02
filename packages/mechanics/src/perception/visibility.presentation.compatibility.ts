import type { EncounterViewerPerceptionCell } from './perception.types'
import type { EncounterWorldCellEnvironment, WorldObscurationPresentationCause } from '../environment/environment.types'

/**
 * **Compatibility-only:** fills `obscurationPresentationCauses` when world merge left them empty.
 *
 * **Why it remains:** `resolveWorldEnvironmentForCell` / zone sync normally populate causes for spells and
 * synced zones. Hand-built encounters, minimal test fixtures, and older saved states may have merged world
 * fields (lighting, `visibilityObscured`, MD flags) **without** cause metadata. Presentation would otherwise
 * lose source-aware tinting (e.g. fog vs darkness). This bridges **stable combat perception**
 * (`maskedByDarkness` / `maskedByMagicalDarkness` from {@link resolveViewerPerceptionForCell}) into the
 * same cause list the canonical pipeline consumes.
 *
 * **Classification:** required long-term compatibility — not a second resolver; it only **derives missing
 * metadata** so {@link buildVisibilityContributors} + {@link resolveCellVisibility} see a consistent world shape.
 *
 * **When not used:** If `world.obscurationPresentationCauses.length > 0`, this is a no-op (returns the same
 * reference). Prefer authoring zones/baseline so merge emits causes; then inference is unnecessary.
 *
 * **Later removal:** Could shrink if all encounter sources guarantee causes, or if we migrate saved state in
 * one shot — until then, keep this isolated here (not in the renderer).
 */
export function inferObscurationPresentationCausesWhenMissing(
  world: EncounterWorldCellEnvironment,
  perception: EncounterViewerPerceptionCell,
): EncounterWorldCellEnvironment {
  if (world.obscurationPresentationCauses.length > 0) return world
  const causes: WorldObscurationPresentationCause[] = []
  if (perception.maskedByMagicalDarkness) {
    causes.push('magical-darkness')
  } else if (perception.maskedByDarkness) {
    if (world.lightingLevel === 'darkness') causes.push('darkness')
    if (world.visibilityObscured === 'heavy') causes.push('environment')
    if (causes.length === 0) causes.push('darkness')
  }
  return { ...world, obscurationPresentationCauses: causes }
}
