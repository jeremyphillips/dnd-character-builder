import type { Monster } from '@/features/content/monsters/domain/types'
import { getAbilityScoreValue } from '@/features/mechanics/domain/character/abilities/abilityScoreMap'
import {
  calculateCreatureArmorClass,
  type CreatureArmorCatalogEntry,
  type CreatureArmorClassResult,
  type CreatureArmorInput,
} from '@/features/mechanics/domain/equipment/armorClass'

type ArmorCatalog = Record<string, CreatureArmorCatalogEntry>
type MonsterArmorSource = Pick<Monster, 'mechanics'>

/** Unarmored AC baseline before natural offset and DEX; single source of truth until ruleset config exposes it. */
export const MONSTER_UNARMORED_AC_BASELINE = 10

function resolveMonsterArmorReference(
  monster: MonsterArmorSource,
  armorRef: string,
  armorById: ArmorCatalog,
): CreatureArmorInput | null {
  const wrappedArmor = monster.mechanics.equipment?.armor?.[armorRef]
  const catalogArmorId = wrappedArmor?.armorId ?? armorRef
  const catalogArmor = armorById[catalogArmorId]

  if (!catalogArmor) {
    return null
  }

  return {
    ...catalogArmor,
    acModifier: wrappedArmor?.acModifier,
    refId: armorRef,
  }
}

export function calculateMonsterArmorClass(
  monster: MonsterArmorSource,
  armorById: ArmorCatalog,
): CreatureArmorClassResult {
  const armorClass = monster.mechanics.armorClass

  if (armorClass.kind === 'fixed') {
    return {
      value: armorClass.value,
      breakdown: {
        parts: [{ kind: 'override', label: 'Fixed', value: armorClass.value }],
      },
    }
  }

  const dexterityScore = getAbilityScoreValue(monster.mechanics.abilities, 'dex')

  if (armorClass.kind === 'equipment') {
    const armors = (armorClass.armorRefs ?? [])
      .map((armorRef) => resolveMonsterArmorReference(monster, armorRef, armorById))
      .filter((armor): armor is CreatureArmorInput => armor != null)

    return calculateCreatureArmorClass({
      dexterityScore,
      defaultBaseAC: 10,
      baseLabel: 'Base',
      overrideAC: armorClass.override,
      armors,
    })
  }

  return calculateCreatureArmorClass({
    dexterityScore,
    defaultBaseAC:
      MONSTER_UNARMORED_AC_BASELINE + (armorClass.offset ?? 0),
    baseLabel: 'Natural Armor',
    overrideAC: armorClass.override,
  })
}
