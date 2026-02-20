import type { Character } from "@/shared/types/character.core";
import { useActiveCampaign } from "@/app/providers/ActiveCampaignProvider";
import { calculateArmorClass } from "../domain/combat/calculateArmorClass";

export function useCombatStats(character: Character) {
  const { editionId: activeEditionId } = useActiveCampaign()

  const calculatedArmorClass = calculateArmorClass(character, activeEditionId ?? '')

  return {
    calculatedArmorClass
  }
}
