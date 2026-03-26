/**
 * Encounter participation vs death vs remains — domain semantics
 * ================================================================
 *
 * **Audit (implicit rules before this module):**
 * - `currentHitPoints <= 0` was used as “defeated” / out of initiative
 *   (`buildAliveInitiativeParticipants` in runtime.ts).
 * - `remains` + `diedAtRound` were set together when damage finalized 0 HP
 *   (including Undead Fortitude failure path); cleared on revival.
 * - `death-outcome` effects only run when `currentHitPoints <= 0`: they do not
 *   deal the killing blow; they refine **remains** (e.g. dust) after lethal hits.
 * - `dead-creature` targeting mixed HP === 0 with remains checks (dust/disintegrated
 *   excluded) without a single named predicate.
 *
 * **Layers (intended meanings):**
 * 1. **Encounter participation** — still in initiative / normal turn flow?
 *    Represented here by `isActiveCombatant` / `isDefeatedCombatant` (HP > 0 vs ≤ 0).
 * 2. **Death record** — rules/narrative “this creature’s death was recorded”?
 *    Represented by `diedAtRound` (and usually `remains`) when lethal 0 HP is applied.
 * 3. **Remains** — what is left for targeting (corpse, bones, dust, disintegrated).
 *
 * **Recommended option for this codebase:** Option C–style — keep existing instance
 * fields (`remains`, `diedAtRound`, HP) and expose semantics only through these helpers
 * so call sites stop re-interpreting raw numbers. A dedicated `encounterStatus` field
 * would duplicate HP until we model unconscious-at-0 separately from dead.
 */

import type { CombatantInstance } from './types/combatant.types'

/** In initiative and normal “living” targeting — HP above 0. */
export function isActiveCombatant(c: CombatantInstance): boolean {
  return c.stats.currentHitPoints > 0
}

/**
 * Defeated for encounter flow: no longer counts as “alive” for initiative re-rolls
 * and cannot be chosen for actions that require a living target (`single-creature`, etc.).
 * In this engine that is **HP ≤ 0** (HP is clamped at 0).
 */
export function isDefeatedCombatant(c: CombatantInstance): boolean {
  return c.stats.currentHitPoints <= 0
}

/**
 * Death **recorded** this encounter: revival windows and aftermath apply.
 * Prefer `diedAtRound`; when tests or migrations only set HP to 0, use
 * `isDefeatedCombatant` + `canTargetAsDeadCreature` instead of inferring “dead” from HP alone.
 */
export function isDeadCombatant(c: CombatantInstance): boolean {
  return c.diedAtRound != null
}

/**
 * Targeting for `CombatActionTargetingProfile.kind === 'dead-creature'`.
 * Requires exactly **0 HP** (engine never stores negative HP) and remains that still
 * represent a targetable body (`corpse` / `bones`, or **undefined** remains treated as corpse).
 * Excludes `dust` and `disintegrated` (destroyed / no intact corpse).
 */
export function canTargetAsDeadCreature(c: CombatantInstance): boolean {
  if (c.stats.currentHitPoints !== 0) return false
  const r = c.remains
  if (r === 'dust' || r === 'disintegrated') return false
  return true
}

/**
 * Something physical remains on the grid worth tracking (excludes total disintegration).
 * Useful for narrative/spawn hooks; targeting uses {@link canTargetAsDeadCreature}.
 */
export function hasRemainsOnGrid(c: CombatantInstance): boolean {
  const r = c.remains
  if (r === undefined) return false
  return r !== 'disintegrated'
}

/**
 * Body intact enough for Raise Dead–style revival checks (not dust / disintegrated).
 * Does not assert HP — pair with `isDefeatedCombatant` or `canTargetAsDeadCreature` as needed.
 */
export function hasIntactRemainsForRevival(c: CombatantInstance): boolean {
  const r = c.remains
  if (r === 'dust' || r === 'disintegrated') return false
  return true
}
