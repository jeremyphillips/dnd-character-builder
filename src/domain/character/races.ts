import { getOptions } from "../options";
import { getById } from "../lookups";
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