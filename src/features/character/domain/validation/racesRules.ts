// import { getAllowedRaceIds as engineGetAllowedRaceIds } from '@/features/mechanics/domain/character-build/options'
// import { getById } from '@/domain/lookups'
// import { races } from "@/data"
// import type { Race, SettingId } from "@/data/types"
// import type { EditionId } from "@/data/editions/edition.types"

// export const getAllowedRaceIds = (editionId: EditionId, settingId?: SettingId): string[] => {
//   return engineGetAllowedRaceIds(editionId, settingId)
// }

// export const getAllowedRaces = (editionId: EditionId, settingId?: SettingId): Race[] => {
//   return getAllowedRaceIds(editionId, settingId)
//     .map((id) => getById(races, id))
//     .filter((r): r is Race => r != null)
// }