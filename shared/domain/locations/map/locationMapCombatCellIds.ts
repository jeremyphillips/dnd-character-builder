import { makeGridCellId } from '../../grid/gridCellIds';

/**
 * Parses non-negative `x,y` author coords; allows optional whitespace around the comma (legacy / hand-edited maps).
 */
function parseNonNegativeAuthorCellXY(t: string): { x: number; y: number } | null {
  const m = /^(\d+)\s*,\s*(\d+)$/.exec(t.trim());
  if (!m) return null;
  return { x: Number(m[1]), y: Number(m[2]) };
}

/**
 * Location authoring uses `x,y`; combat square grids use `c-x-y`.
 * Shared so map render derivation and encounter build stay aligned.
 */
export function authorCellIdToCombatCellId(authorCellId: string): string {
  const t = authorCellId.trim();
  const p = parseNonNegativeAuthorCellXY(t);
  if (p) return `c-${p.x}-${p.y}`;
  return t;
}

/**
 * Canonical `x,y` for matching location map `cellEntries[].cellId` to combat-derived author ids (`combatCellIdToAuthorCellId`).
 */
export function normalizeAuthorCellIdForMapLookup(cellId: string): string | null {
  const p = parseNonNegativeAuthorCellXY(cellId);
  if (!p) return null;
  return makeGridCellId(p.x, p.y);
}

/** Inverse of {@link authorCellIdToCombatCellId} for `c-x-y` ids. */
export function combatCellIdToAuthorCellId(combatCellId: string): string | null {
  const m = /^c-(\d+)-(\d+)$/.exec(combatCellId.trim());
  if (!m) return null;
  return `${m[1]},${m[2]}`;
}
