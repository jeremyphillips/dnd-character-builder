import type { Effect } from '../effects.types'
import type { Equipment, EquipmentLoadout } from '@/shared/types/character.core'
import { equipment as equipmentData } from '@/data'
import type { ArmorEditionDatum } from '@/data/equipment/armor.types'

function getArmorEditionData(
  armorId: string,
  edition: string
): ArmorEditionDatum | null {
  const item = equipmentData.armor.find((a) => a.id === armorId)
  return (item?.editionData?.find((e) => e.edition === edition) as ArmorEditionDatum) ?? null
}

function buildArmorFormulaEffect(
  baseAC: number,
  category: string,
  source: string
): Effect {
  if (category === 'heavy') {
    return {
      kind: 'formula',
      target: 'armor_class',
      formula: { base: baseAC },
      source,
    } as Effect
  }

  if (category === 'medium') {
    return {
      kind: 'formula',
      target: 'armor_class',
      formula: { base: baseAC, ability: 'dexterity', maxAbilityContribution: 2 },
      source,
    } as Effect
  }

  return {
    kind: 'formula',
    target: 'armor_class',
    formula: { base: baseAC, ability: 'dexterity' },
    source,
  } as Effect
}

/**
 * Pure translation layer: equipment bag → flat Effect[].
 *
 * Produces effects for ALL owned items:
 *  - FormulaEffect per armor (base AC + ability + dex cap)
 *  - ModifierEffect per shield (+AC bonus)
 *  - Magic item effects (TODO)
 *
 * Each effect is tagged with `source` using the convention:
 *  - 'armor:<itemId>'
 *  - 'shield:<itemId>'
 *  - 'magic_item:<itemId>'
 */
export function getEquipmentEffects(
  equipment: Equipment | undefined,
  edition: string
): Effect[] {
  if (edition !== '5e') return []

  const ownedArmorIds = equipment?.armor ?? []
  const effects: Effect[] = []

  for (const id of ownedArmorIds) {
    const item = equipmentData.armor.find((a) => a.id === id)
    const ed = getArmorEditionData(id, edition)
    if (!item || !ed) continue

    if (ed.category === 'shields') {
      const bonus = ed.acBonus ?? 0
      if (bonus > 0) {
        effects.push({
          kind: 'modifier',
          target: 'armor_class',
          mode: 'add',
          value: bonus,
          source: `shield:${id}`,
        })
      }
    } else {
      const baseAC = ed.baseAC ?? 10
      const category = ed.category ?? 'light'
      effects.push(buildArmorFormulaEffect(baseAC, category, `armor:${id}`))
    }
  }

  // TODO: magic item effects (e.g. +1 armor, stat bonuses)

  return effects
}

/**
 * Filter candidate equipment effects down to only the active loadout.
 *
 * - Keeps the armor effect matching loadout.armorId (or none if unarmored)
 * - Keeps the shield effect matching loadout.shieldId (or none if no shield)
 * - Keeps all non-armor/shield effects (magic items, etc.)
 */
export function selectActiveEquipmentEffects(
  candidateEffects: Effect[],
  loadout: EquipmentLoadout | undefined
): Effect[] {
  const activeArmorSource = loadout?.armorId ? `armor:${loadout.armorId}` : null
  const activeShieldSource = loadout?.shieldId ? `shield:${loadout.shieldId}` : null

  return candidateEffects.filter((e) => {
    const source = 'source' in e ? (e as { source?: string }).source : undefined
    if (!source) return true
    if (source.startsWith('armor:')) return source === activeArmorSource
    if (source.startsWith('shield:')) return source === activeShieldSource
    return true
  })
}

/**
 * Resolve a loadout from the character, with legacy fallback.
 * Reads combat.loadout first, falls back to parsing selectedArmorConfigId.
 */
export function resolveLoadout(
  combat: { loadout?: EquipmentLoadout; selectedArmorConfigId?: string | null } | undefined
): EquipmentLoadout {
  if (combat?.loadout) return combat.loadout

  const selectedId = combat?.selectedArmorConfigId
  if (!selectedId) return {}

  const [armorPart, shieldPart] = selectedId.split('|')
  return {
    armorId: armorPart && armorPart !== 'unarmored' ? armorPart : undefined,
    shieldId: shieldPart && shieldPart !== 'no-shield' ? shieldPart : undefined,
  }
}

/**
 * Resolve the actively wielded weapon IDs.
 *
 * If the loadout has explicit weapon selections, use those.
 * Otherwise fall back to the first owned weapon as main hand
 * (preserves pre-loadout behavior).
 */
export function resolveWieldedWeaponIds(
  loadout: EquipmentLoadout,
  ownedWeaponIds: string[]
): string[] {
  const mainHand = loadout.mainHandWeaponId ?? ownedWeaponIds[0]
  const offHand = loadout.offHandWeaponId

  const ids: string[] = []
  if (mainHand) ids.push(mainHand)
  if (offHand && offHand !== mainHand) ids.push(offHand)
  return ids
}
