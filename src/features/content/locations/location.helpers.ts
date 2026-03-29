import type { Location } from './types'

/**
 * Sort locations by structural scale, then name. Uses `scale` for ordering.
 */
const SCALE_ORDER: Array<Location['scale']> = [
  'world',
  'region',
  'subregion',
  'city',
  'district',
  'site',
  'building',
  'floor',
  'room',
]

export function sortLocations(a: Location, b: Location): number {
  const scaleDiff = SCALE_ORDER.indexOf(a.scale) - SCALE_ORDER.indexOf(b.scale)

  if (scaleDiff !== 0) return scaleDiff

  return a.name.localeCompare(b.name)
}

const INDENT_MAP: Partial<Record<Location['scale'], number>> = {
  world: 0,
  region: 1,
  subregion: 2,
  city: 3,
  district: 4,
  site: 5,
  building: 6,
  floor: 7,
  room: 8,
}

export function getIndentLevel(location: { scale: Location['scale'] }): number {
  return INDENT_MAP[location.scale] ?? 0
}
