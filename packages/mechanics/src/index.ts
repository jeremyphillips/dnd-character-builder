/**
 * @package @rpg-world-builder/mechanics
 *
 * Public **combat** surface aligned with
 * `docs/reference/combat/adr-shared-combat-extraction.md`: application seams,
 * wire intents, results/events, and canonical persisted state types.
 *
 * **Stability:** Treat these exports as **provisionally stable** for upcoming
 * server work; semver and a narrower `exports` map are follow-ups.
 *
 * The app alias `@/features/mechanics/domain/*` still resolves to this tree; deep
 * imports remain valid for non-combat mechanics and internal modules.
 */

export * from './combat/application'
export * from './combat/intents'
export * from './combat/results'
export * from './combat/state/types'
