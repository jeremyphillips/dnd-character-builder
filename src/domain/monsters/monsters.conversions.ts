import type {
  Monster,
  EditionRule,
  EditionRule1e,
  EditionRule2e,
  EditionRule3e,
  EditionRule35e,
  EditionRule4e,
  EditionRule5e,
  EditionRuleBecmi,
  EditionRuleBx,
  EditionRuleHolmes,
  EditionRuleOdd,
  Mechanics5e,
  Lore5e,
  Attack,
  Movement,
} from '@/data'

// ---------------------------------------------------------------------------
// Core Mechanical Model — edition-agnostic intermediate representation
// ---------------------------------------------------------------------------

interface CoreMechanics {
  hitDice: number
  hitDieSize: number
  armorClass: number
  hpAverage: number
  attackBonus: number
  attacks: Attack[]
  movement: Movement
  specialDefenses?: string[]
}

// ---------------------------------------------------------------------------
// 2e → Core
// ---------------------------------------------------------------------------

function convert2eToCore(rule: EditionRule2e, _monster: Monster): CoreMechanics {
  const { mechanics } = rule

  return {
    hitDice: mechanics.hitDice,
    hitDieSize: 8,
    armorClass: 19 - mechanics.armorClass,  // descending AC → ascending
    hpAverage: Math.round(mechanics.hitDice * 4.5),
    attackBonus: 20 - mechanics.thac0,       // THAC0 → attack bonus
    attacks: mechanics.attacks,
    movement: {
      ground: mechanics.movement.ground
        ? Math.round(mechanics.movement.ground / 3 / 5) * 5  // 2e segments → 5e feet
        : undefined,
      fly: mechanics.movement.fly
        ? Math.round(mechanics.movement.fly / 3 / 5) * 5
        : undefined,
      swim: mechanics.movement.swim
        ? Math.round(mechanics.movement.swim / 3 / 5) * 5
        : undefined,
    },
    specialDefenses: mechanics.specialDefenses,
  }
}

// ---------------------------------------------------------------------------
// 1e / Holmes → Core
// ---------------------------------------------------------------------------

function convert1eToCore(rule: EditionRule1e | EditionRuleHolmes, _monster: Monster): CoreMechanics {
  const { mechanics } = rule
  const hitDieModifier = mechanics.hitDieModifier ?? 0

  return {
    hitDice: mechanics.hitDice,
    hitDieSize: 8,                                       // 1e monsters always use d8
    armorClass: 19 - mechanics.armorClass,               // descending AC → ascending
    hpAverage: Math.round((mechanics.hitDice * 4.5) + hitDieModifier),
    attackBonus: 20 - mechanics.thac0,                   // THAC0 → attack bonus
    attacks: mechanics.attacks,
    movement: {
      ground: mechanics.movement.ground
        ? Math.round(mechanics.movement.ground / 3 / 5) * 5
        : undefined,
      fly: mechanics.movement.fly
        ? Math.round(mechanics.movement.fly / 3 / 5) * 5
        : undefined,
      swim: mechanics.movement.swim
        ? Math.round(mechanics.movement.swim / 3 / 5) * 5
        : undefined,
    },
    specialDefenses: mechanics.specialDefenses,
  }
}

// ---------------------------------------------------------------------------
// OD&D → Core (variable hit die size: d6 or d8)
// ---------------------------------------------------------------------------

function convertOddToCore(rule: EditionRuleOdd, _monster: Monster): CoreMechanics {
  const { mechanics } = rule
  const hitDieModifier = mechanics.hitDieModifier ?? 0
  const avgPerDie = (mechanics.hitDieSize + 1) / 2       // 3.5 for d6, 4.5 for d8

  return {
    hitDice: mechanics.hitDice,
    hitDieSize: mechanics.hitDieSize,
    armorClass: 19 - mechanics.armorClass,               // descending AC → ascending
    hpAverage: Math.round((mechanics.hitDice * avgPerDie) + hitDieModifier),
    attackBonus: 20 - mechanics.thac0,                   // THAC0 → attack bonus
    attacks: mechanics.attacks,
    movement: {
      ground: mechanics.movement.ground
        ? Math.round(mechanics.movement.ground / 3 / 5) * 5
        : undefined,
      fly: mechanics.movement.fly
        ? Math.round(mechanics.movement.fly / 3 / 5) * 5
        : undefined,
      swim: mechanics.movement.swim
        ? Math.round(mechanics.movement.swim / 3 / 5) * 5
        : undefined,
    },
    specialDefenses: mechanics.specialDefenses,
  }
}

// ---------------------------------------------------------------------------
// Classic D&D (B/X, BECMI) → Core
// ---------------------------------------------------------------------------

function convertClassicDnDToCore(rule: EditionRuleBecmi | EditionRuleBx, _monster: Monster): CoreMechanics {
  const { mechanics } = rule
  const hitDieModifier = mechanics.hitDieModifier ?? 0

  return {
    hitDice: mechanics.hitDice,
    hitDieSize: 8,                                       // BECMI monsters always use d8
    armorClass: 19 - mechanics.armorClass,               // descending AC → ascending
    hpAverage: Math.round((mechanics.hitDice * 4.5) + hitDieModifier),
    attackBonus: 20 - mechanics.thac0,                   // THAC0 → attack bonus
    attacks: mechanics.attacks,
    movement: {
      ground: mechanics.movement.ground
        ? Math.round(mechanics.movement.ground / 3 / 5) * 5
        : undefined,
      fly: mechanics.movement.fly
        ? Math.round(mechanics.movement.fly / 3 / 5) * 5
        : undefined,
      swim: mechanics.movement.swim
        ? Math.round(mechanics.movement.swim / 3 / 5) * 5
        : undefined,
    },
    specialDefenses: mechanics.specialDefenses,
  }
}

// ---------------------------------------------------------------------------
// d20 System (3e, 3.5e) → Core
// ---------------------------------------------------------------------------

function convertD20ToCore(rule: EditionRule3e | EditionRule35e, _monster: Monster): CoreMechanics {
  const { mechanics } = rule
  const avgPerDie = (mechanics.hitDieSize + 1) / 2

  return {
    hitDice: mechanics.hitDice,
    hitDieSize: mechanics.hitDieSize,
    armorClass: mechanics.armorClass,              // already ascending
    hpAverage: Math.round(mechanics.hitDice * avgPerDie),
    attackBonus: mechanics.baseAttackBonus,         // BAB → attack bonus
    attacks: mechanics.attacks,
    movement: mechanics.movement,                  // already in feet
    specialDefenses: mechanics.specialDefenses,
  }
}

// ---------------------------------------------------------------------------
// 4e → Core (flat HP, no hit dice — reverse-engineer HD from HP)
// ---------------------------------------------------------------------------

function convert4eToCore(rule: EditionRule4e, _monster: Monster): CoreMechanics {
  const { mechanics } = rule
  const estimatedHD = Math.max(1, Math.round(mechanics.hitPoints / 4.5))

  return {
    hitDice: estimatedHD,
    hitDieSize: 8,
    armorClass: mechanics.armorClass,               // already ascending
    hpAverage: mechanics.hitPoints,                  // flat HP, direct pass-through
    attackBonus: Math.floor(mechanics.level / 2) + 3, // level-based estimate
    attacks: mechanics.attacks,
    movement: mechanics.movement,                    // already in feet
    specialDefenses: mechanics.specialDefenses,
  }
}

// ---------------------------------------------------------------------------
// Core → 5e
// ---------------------------------------------------------------------------

function convertCoreTo5e(core: CoreMechanics, rule: EditionRule1e | EditionRule2e | EditionRule3e | EditionRule35e | EditionRule4e | EditionRuleBecmi | EditionRuleBx | EditionRuleHolmes | EditionRuleOdd): EditionRule5e {
  const proficiencyBonus = Math.ceil(core.hitDice / 4) + 1

  const mechanics: Mechanics5e = {
    hitDice: core.hitDice,
    hitDieSize: core.hitDieSize,
    armorClass: core.armorClass,
    attackBonus: core.attackBonus,
    proficiencyBonus,
    movement: core.movement,
    attacks: core.attacks,
    specialDefenses: core.specialDefenses,
  }

  // 1e XP = base + (xpPerHp * avgHP); 2e XP is already total
  const xpValue = rule.edition === '1e' && rule.lore.xpPerHp
    ? rule.lore.xpValue + (rule.lore.xpPerHp * core.hpAverage)
    : rule.lore.xpValue

  const lore: Lore5e = {
    alignment: rule.lore.alignment,
    xpValue,
    challengeRating: estimateCR(core),
    intelligence: rule.lore.intelligence,
  }

  return {
    edition: '5e',
    mechanics,
    lore,
    source: rule.source,
  }
}

// ---------------------------------------------------------------------------
// CR estimation from core stats (rough heuristic)
// ---------------------------------------------------------------------------

function estimateCR(core: CoreMechanics): number {
  const hp = core.hpAverage
  if (hp <= 6) return 0
  if (hp <= 35) return 0.25
  if (hp <= 49) return 0.5
  if (hp <= 70) return 1
  if (hp <= 85) return 2
  if (hp <= 100) return 3
  if (hp <= 115) return 4
  if (hp <= 130) return 5
  if (hp <= 145) return 6
  if (hp <= 160) return 7
  if (hp <= 175) return 8
  if (hp <= 190) return 9
  return 10
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Convert a monster's edition rule to a target edition.
 * Supports 1e → 5e, 2e → 5e, Holmes → 5e, BECMI → 5e, and B/X → 5e via the core mechanical model.
 * Returns `null` if conversion is not possible.
 */
export function convertEditionRule(
  monster: Monster,
  sourceRule: EditionRule,
  targetEdition: string
): EditionRule | null {
  if (sourceRule.edition === '1e' && targetEdition === '5e') {
    const core = convert1eToCore(sourceRule, monster)
    return convertCoreTo5e(core, sourceRule)
  }

  if (sourceRule.edition === '2e' && targetEdition === '5e') {
    const core = convert2eToCore(sourceRule, monster)
    return convertCoreTo5e(core, sourceRule)
  }

  if (sourceRule.edition === 'becmi' && targetEdition === '5e') {
    const core = convertClassicDnDToCore(sourceRule, monster)
    return convertCoreTo5e(core, sourceRule)
  }

  if (sourceRule.edition === 'bx' && targetEdition === '5e') {
    const core = convertClassicDnDToCore(sourceRule, monster)
    return convertCoreTo5e(core, sourceRule)
  }

  if (sourceRule.edition === 'b' && targetEdition === '5e') {
    const core = convert1eToCore(sourceRule, monster)
    return convertCoreTo5e(core, sourceRule)
  }

  if (sourceRule.edition === 'odd' && targetEdition === '5e') {
    const core = convertOddToCore(sourceRule, monster)
    return convertCoreTo5e(core, sourceRule)
  }

  if (sourceRule.edition === '3e' && targetEdition === '5e') {
    const core = convertD20ToCore(sourceRule, monster)
    return convertCoreTo5e(core, sourceRule)
  }

  if (sourceRule.edition === '3.5e' && targetEdition === '5e') {
    const core = convertD20ToCore(sourceRule, monster)
    return convertCoreTo5e(core, sourceRule)
  }

  if (sourceRule.edition === '4e' && targetEdition === '5e') {
    const core = convert4eToCore(sourceRule, monster)
    return convertCoreTo5e(core, sourceRule)
  }

  return null
}

/**
 * Attempt to find or convert an edition rule for the given target edition.
 * Returns `{ rule, converted, sourceEdition }`.
 */
export function resolveEditionRule(
  monster: Monster,
  targetEdition: string
): { rule: EditionRule; converted: boolean; sourceEdition?: string } | null {
  // 1. Native match
  const native = monster.editionRules.find((r) => r.edition === targetEdition)
  if (native) return { rule: native, converted: false }

  // 2. Try converting from any available edition
  for (const sourceRule of monster.editionRules) {
    const converted = convertEditionRule(monster, sourceRule, targetEdition)
    if (converted) {
      return { rule: converted, converted: true, sourceEdition: sourceRule.edition }
    }
  }

  return null
}
