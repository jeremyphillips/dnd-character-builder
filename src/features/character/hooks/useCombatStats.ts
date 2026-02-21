import { useMemo } from 'react'
import type { Character, AbilityScores } from '@/shared/types/character.core'
import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider'
import { editions } from '@/data'
import { weapons as weaponCatalog } from '@/data/equipment/weapons'
import { resolveEquipmentEdition } from '@/features/equipment/domain'
import type { WeaponEditionDatum } from '@/data/equipment/weapons.types'
import { getArmorConfigurations, getActiveArmorConfig } from '../domain/combat/armorConfigurations'

// ---------------------------------------------------------------------------
// Attack types
// ---------------------------------------------------------------------------

export interface AttackEntry {
  weaponId: string
  name: string
  attackBonus: number
  /** e.g. "+2 prof + +3 STR" */
  attackBreakdown: string
  damage: string
  damageType: string
}

// ---------------------------------------------------------------------------
// Attack helpers
// ---------------------------------------------------------------------------

function abilityMod(score: number | null | undefined): number {
  if (score == null) return 0
  return Math.floor((score - 10) / 2)
}

function getProficiencyBonus(editionId: string, totalLevel: number): number {
  const ed = editions.find(e => e.id === editionId)
  const table = ed?.levelScaling?.proficiencyBonus
  if (!table) return 0
  return (table as Record<number, number>)[totalLevel] ?? 0
}

function getWeaponEditionData(weaponId: string, editionId: string): WeaponEditionDatum | undefined {
  const resolved = resolveEquipmentEdition(editionId)
  const weapon = weaponCatalog.find(w => w.id === weaponId)
  return weapon?.editionData?.find(d => d.edition === resolved)
}

/** Determine the relevant ability modifier for a weapon attack. */
function getAttackAbilityMod(
  editionData: WeaponEditionDatum,
  abilityScores: AbilityScores | undefined,
): { mod: number; label: string } {
  const str = abilityMod(abilityScores?.strength)
  const dex = abilityMod(abilityScores?.dexterity)

  const isFinesse = editionData.properties?.includes('finesse')
  const isRanged = editionData.type === 'ranged'

  if (isFinesse) {
    return dex >= str
      ? { mod: dex, label: 'DEX' }
      : { mod: str, label: 'STR' }
  }
  if (isRanged) return { mod: dex, label: 'DEX' }
  return { mod: str, label: 'STR' }
}

function formatDamage(editionData: WeaponEditionDatum): string {
  const dmg = editionData.damage
  if (!dmg) return '—'
  return dmg.default ?? dmg.sm ?? '—'
}

/**
 * Build the attack list from a character's equipped weapons.
 */
export function getCharacterAttacks(character: Character): AttackEntry[] {
  const weaponIds = character.equipment?.weapons ?? []
  if (weaponIds.length === 0) return []

  const editionId = character.edition
  const profBonus = getProficiencyBonus(editionId, character.totalLevel ?? 1)

  return weaponIds.map(id => {
    const weapon = weaponCatalog.find(w => w.id === id)
    const edData = getWeaponEditionData(id, editionId)
    const { mod, label } = edData
      ? getAttackAbilityMod(edData, character.abilityScores)
      : { mod: 0, label: '—' }

    const bonus = profBonus + mod
    const sign = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

    return {
      weaponId: id,
      name: weapon?.name ?? id,
      attackBonus: bonus,
      attackBreakdown: `${sign(profBonus)} prof ${sign(mod)} ${label}`,
      damage: edData ? formatDamage(edData) : '—',
      damageType: weapon?.damageType ?? '',
    }
  })
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

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

  const attacks = useMemo(
    () => getCharacterAttacks(character),
    [character],
  )

  return {
    calculatedArmorClass,
    armorConfigurations,
    activeArmorConfig,
    attacks,
  }
}
