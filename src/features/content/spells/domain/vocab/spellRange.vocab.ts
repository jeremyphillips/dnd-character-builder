/**
 * Display labels for spell range kinds that are fixed strings (not distance numerics or special prose).
 */
export const SPELL_RANGE_KIND_OPTIONS = [
  { id: 'self', name: 'Self' },
  { id: 'touch', name: 'Touch' },
  { id: 'sight', name: 'Sight' },
  { id: 'unlimited', name: 'Unlimited' },
] as const;

/** Range kinds authored as static labels in `SPELL_RANGE_KIND_OPTIONS`. */
export type SpellRangeKindId = (typeof SPELL_RANGE_KIND_OPTIONS)[number]['id'];

const SPELL_RANGE_KIND_NAME = new Map<string, string>(
  SPELL_RANGE_KIND_OPTIONS.map((o) => [o.id, o.name] as const),
);

/** Display name for a fixed range kind, or undefined if not a vocab kind. */
export function getSpellRangeKindName(kind: SpellRangeKindId): string {
  return SPELL_RANGE_KIND_NAME.get(kind) ?? kind;
}
