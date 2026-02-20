import { useMemo } from 'react'
import type { Character } from '@/shared/types/character.core'
import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider'
import { getArmorConfigurations, getActiveArmorConfig } from '../domain/combat/armorConfigurations'
import type { ArmorConfiguration } from '@features/character/domain/combat'


export function useCombatStats(character: Character) {
  const { editionId: activeEditionId } = useActiveCampaign()
  const edition = activeEditionId ?? ''

  const armorConfigurations = useMemo(
    () => getArmorConfigurations(character, edition),
    [character, edition],
  )

  const activeArmorConfig = useMemo(
    () => getActiveArmorConfig(armorConfigurations, character.combat?.selectedArmorConfigId),
    [armorConfigurations, character.combat?.selectedArmorConfigId],
  )

  const calculatedArmorClass = useMemo(() => {
    if (!activeArmorConfig) return { value: 10, breakdown: '10 (base)' }
    return { value: activeArmorConfig.totalAC, breakdown: activeArmorConfig.breakdown }
  }, [activeArmorConfig])

  return {
    calculatedArmorClass,
    armorConfigurations,
    activeArmorConfig,
  }
}
