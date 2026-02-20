import { getOptions } from "@/domain/options";
import { getById } from '@/domain/lookups'
import { races } from "@/data";
import type { Race, SettingId, EditionId } from "@/data/types";

export const getAllowedRaceIds = (editionId: EditionId, settingId?: SettingId): string[] => {
  return getOptions('races', editionId, settingId)
}

export const getAllowedRaces = (editionId: EditionId, settingId?: SettingId): Race[] => {
  return getAllowedRaceIds(editionId, settingId)
    .map((id) => getById(races, id))
    .filter((r): r is Race => r != null)
}