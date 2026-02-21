import { estimateThreatLevel } from "../../calculations/estimateThreatLevel"
import type { CoreMechanics } from "../../core/combat.types"
import type { Mechanics5e } from "../../edition/5e/shared.types"
import type { Lore5e } from "../../edition/5e/monster.types"

// ---------------------------------------------------------------------------
// Core → 5e
// ---------------------------------------------------------------------------

export function convertCoreTo5e(core: CoreMechanics, rule: EditionRule1e | EditionRule2e | EditionRule3e | EditionRule35e | EditionRule4e | EditionRuleBecmi | EditionRuleBx | EditionRuleHolmes | EditionRuleOdd): EditionRule5e {
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
    challengeRating: estimateThreatLevel(core),
    intelligence: rule.lore.intelligence,
  }

  return {
    edition: '5e',
    mechanics,
    lore,
    source: rule.source,
  }
}