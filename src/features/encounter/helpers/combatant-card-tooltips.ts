/** Glossary strings for core stat badges on the active combatant card. */
export const COMBATANT_CORE_STAT_TOOLTIP_BY_LABEL: Record<string, string> = {
  AC: 'Armor Class: how hard you are to hit. Attacks compare against AC unless they use a saving throw instead.',
  HP: 'Hit points: current total out of maximum. At 0 you fall unconscious (or die if damage exceeds max HP).',
  Init: 'Initiative modifier: added to your initiative roll to determine turn order.',
  Move: 'Walking speed in feet (one round). Other movement modes may appear on the stat block.',
}

export const TRACKED_PARTS_BADGE_TOOLTIP =
  'Tracks a multi-part creature resource (e.g. heads or limbs). Some abilities destroy parts before the body falls.'
