import { editions, settings } from '@/data'

export const getRaceOptions = (
  editionId?: string,
  settingId?: string
): string[] => {
  if (!editionId) return []

  const edition = editions.find(e => e.id === editionId)
  if (!edition) return []

  let races = [...edition.races]

  const setting = settingId
    ? settings.find(c => c.id === settingId)
    : null

  const overrides = setting?.raceOverrides

  if (overrides?.only) {
    return [...overrides.only]
  }

  if (overrides?.remove) {
    races = races.filter(r => !overrides.remove!.includes(r))
  }

  if (overrides?.add) {
    races = Array.from(new Set([...races, ...overrides.add]))
  }

  return races
}
