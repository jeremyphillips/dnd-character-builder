/**
 * Maps editions that don't have their own equipment data to the nearest
 * supported edition.  Equipment stats for pre-2e editions (1e, BECMI, B/X,
 * Basic, OD&D) are close enough to 2e that the 2e data is a reasonable proxy.
 */
const EQUIPMENT_EDITION_FALLBACK: Record<string, string> = {
  '1e':   '2e',
  'becmi': '2e',
  'bx':   '2e',
  'b':    '2e',
  'odd':  '2e'
}

/**
 * Resolve the effective equipment edition.
 * If the edition has its own equipment data (5e, 2e, 3e, 4e) it passes
 * through unchanged.  Otherwise it falls back to the closest supported
 * edition via EQUIPMENT_EDITION_FALLBACK.
 */
export const resolveEquipmentEdition = (edition: string): string =>
  EQUIPMENT_EDITION_FALLBACK[edition] ?? edition
