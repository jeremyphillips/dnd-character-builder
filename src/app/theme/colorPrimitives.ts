/**
 * Raw color scales — design-token source of truth for the app theme.
 * Semantic palette (`palette.ts`) maps MUI roles to these primitives; do not
 * reference primitives directly from feature code unless adding new theme wiring.
 *
 * Numbering: lower = lighter, higher = darker (100–500 compact scale).
 */

export const colorPrimitives = {
  /** Parchment-to-dungeon neutrals: warm surfaces, ink, and dark UI chrome. */
  gray: {
    100: '#F5F0E8',
    200: '#4A4A4A',
    300: '#1E1E1E',
    400: '#1A1A1A',
    500: '#121212',
  },

  /** Primary fantasy accent — ember, war banners, deep crimson. */
  red: {
    100: '#E06060',
    200: '#C04040',
    300: '#B33030',
    400: '#8B0000',
    500: '#5C0000',
  },

  /** Treasure / divine metallics — secondary accent golds. */
  gold: {
    100: '#E0C566',
    200: '#D4AF37',
    300: '#A68A2B',
    400: '#8B6F1F', // placeholder — scrutinize (palette uses 100–300 only today)
    500: '#6E5A18', // placeholder — scrutinize
  },

  /** Cool slate for map stone surfaces and rocky terrain (not UI warm gray). */
  mapSlate: {
    100: '#9CA3AF',
    200: '#8B95A4', // placeholder — scrutinize (map uses 100 & 300 only today)
    300: '#6B7280',
    400: '#5B6570', // placeholder — scrutinize
    500: '#4B5563', // placeholder — scrutinize
  },

  /** Map vegetation: plains through deep forest / swamp. */
  mapGreen: {
    100: '#86A35C',
    200: '#5A9A5E',
    300: '#5C6B55',
    400: '#456A48', // placeholder — scrutinize (bridge step; not in swatch keys yet)
    500: '#2D4A32',
  },

  /** Map water — mid tone is canonical swatch; lighter/darker hold depth variants. */
  mapBlue: {
    100: '#A8D4F0', // placeholder — scrutinize (map uses 300 only today)
    200: '#6BAFDB', // placeholder — scrutinize
    300: '#3B82C4',
    400: '#2E6BA8', // placeholder — scrutinize
    500: '#1F4A73', // placeholder — scrutinize
  },

  /** Map arid / sand — mid tone is desert cell fill; steps support dunes/shadows later. */
  mapSand: {
    100: '#F0E4D0', // placeholder — scrutinize (map uses 300 only today)
    200: '#E2C99A', // placeholder — scrutinize
    300: '#D4A574',
    400: '#B88858', // placeholder — scrutinize
    500: '#9A6B45', // placeholder — scrutinize
  },

  white: '#FFFFFF',
  black: '#000000',
} as const
