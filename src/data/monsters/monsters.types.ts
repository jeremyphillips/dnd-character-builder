import type { SettingId } from '../types'

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

// export type AbilityScores = {
//   str?: number
//   dex?: number
//   con?: number
//   int?: number
//   wis?: number
//   cha?: number
// }

export type Attack = {
  name: string
  dice: string
  damageType?: string
  saveEffect?: { ability: string; dc: number }
}

export type Movement = {
  ground?: number
  fly?: number
  swim?: number
  burrow?: number
}

// ---------------------------------------------------------------------------
// Edition-specific mechanics
// ---------------------------------------------------------------------------

interface MechanicsBase {
  hitDice: number
  hitDieSize: number
  armorClass: number
  movement: Movement
  attacks: Attack[]
  specialDefenses?: string[]
}

export interface Mechanics1e {
  hitDice: number
  hitDieModifier?: number          // e.g. -1 for "1-1" HD notation
  armorClass: number               // descending AC
  thac0: number
  movement: Movement
  attacks: Attack[]
  specialAttacks?: string[]
  specialDefenses?: string[]
  psionicAbility?: { min: number | null; max: number | null }
}

export interface Mechanics2e extends MechanicsBase {
  thac0: number
  specialAttacks?: string[]
  morale?: { category: string; value: number }
  magicRestistance?: number // 0-100%
}

export interface Mechanics5e extends MechanicsBase {
  attackBonus: number
  proficiencyBonus?: number
  abilities?: AbilityScores
  traits?: string[]
  actions?: Array<{ name: string; bonus: number; damage: string }>
}

export type MechanicsHolmes = Omit<Mechanics1e, 'psionicAbility'>

export type MechanicsOdd = MechanicsHolmes & {
  hitDieSize: number              // 6 for original LBBs (1974); 8 for post-Greyhawk (1975)
}

export interface MechanicsD20 {
  hitDice: number
  hitDieSize: number              // varies by creature type (d4-d12)
  armorClass: number              // ascending (already 5e-style)
  baseAttackBonus: number         // BAB
  movement: Movement              // already in feet
  attacks: Attack[]
  specialAttacks?: string[]
  specialDefenses?: string[]
  abilities?: AbilityScores       // all 6 scores
  // TODO: saves (Fort/Ref/Will)
  // TODO: skills (Record<string, number>)
  // TODO: feats (string[])
  // TODO: damageReduction?: string          — e.g. "10/magic"
  // TODO: spellResistance?: number
  // TODO: grappleModifier?: number          — 3.5e grapple bonus
  // TODO: touchAC?: number                  — touch AC
  // TODO: flatFootedAC?: number             — flat-footed AC
  // TODO: space?: number                    — creature space in feet
  // TODO: reach?: number                    — natural reach in feet
}

export interface Mechanics4e {
  level: number                    // monster level (replaces HD as scaling metric)
  role: string                     // Artillery, Brute, Controller, Lurker, Skirmisher, Soldier
  roleModifier?: string            // Elite, Solo, Minion (omit for standard)
  hitPoints: number                // flat HP (no dice)
  armorClass: number               // ascending
  fortitude: number                // Fortitude defense
  reflex: number                   // Reflex defense
  will: number                     // Will defense
  initiative: number               // initiative modifier
  movement: Movement               // stored in feet (squares × 5)
  attacks: Attack[]
  specialAttacks?: string[]
  specialDefenses?: string[]
  abilities?: AbilityScores
}

export interface MechanicsClassicDnD {
  hitDice: number
  hitDieSize: number              // always 8
  hitDiceAsterisks?: number       // 0, 1, 2, etc. — special ability XP scaling
  hitDieModifier?: number         // e.g. -1 for "1-1" HD notation
  armorClass: number              // descending AC
  thac0: number                   // derived from HD (Rules Cyclopedia)
  movement: Movement
  attacks: Attack[]
  specialAttacks?: string[]
  specialDefenses?: string[]
  saveAs: { class: string; level: number }
  morale: number                  // 2–12 scale (2d6)
}

// ---------------------------------------------------------------------------
// Edition-specific lore
// ---------------------------------------------------------------------------

interface LoreBase {
  alignment: string
  xpValue: number
}

export interface Lore1e extends LoreBase {
  xpPerHp?: number
  numberAppearing?: { min: number; max: number }
  percentInLair?: number
  frequency?: string
  treasureType?: string | { individual?: string; lair?: string }
  intelligence?: string
  size?: string
}

export interface Lore2e extends LoreBase {
  frequency?: string
  organization?: string
  treasureType?: string
  intelligence?: string
}

export interface Lore5e extends LoreBase {
  challengeRating: number
  intelligence?: string
}

export interface LoreHolmes extends LoreBase {
  numberAppearing?: string          // single dice expression (e.g. "2d4")
  percentInLair?: number
  treasureType?: string
  intelligence?: string
}

export interface LoreD20 extends LoreBase {
  challengeRating: number
  organization?: string
  environment?: string
  intelligence?: string
  // TODO: advancement?: string              — e.g. "4-6 HD (Large); 7-9 HD (Huge)"
  // TODO: levelAdjustment?: number | null   — LA for playable races
  // TODO: treasure?: string                 — e.g. "Standard", "Double standard"
}

export interface Lore4e extends LoreBase {
  origin?: string                  // Natural, Elemental, Shadow, Fey, Aberrant, Immortal
  intelligence?: string
}

export interface LoreClassicDnD extends LoreBase {
  numberAppearing?: { wandering: string; lair: string } // dice expressions
  treasureType?: string
  intelligence?: string
}

// ---------------------------------------------------------------------------
// Edition rules (discriminated union)
// ---------------------------------------------------------------------------

interface EditionRuleBase {
  source?: { book: string; page?: number }
}

export interface EditionRule1e extends EditionRuleBase {
  edition: '1e'
  mechanics: Mechanics1e
  lore: Lore1e
}

export interface EditionRule2e extends EditionRuleBase {
  edition: '2e'
  mechanics: Mechanics2e
  lore: Lore2e
}

export interface EditionRule5e extends EditionRuleBase {
  edition: '5e'
  mechanics: Mechanics5e
  lore: Lore5e
}

export interface EditionRuleBecmi extends EditionRuleBase {
  edition: 'becmi'
  mechanics: MechanicsClassicDnD
  lore: LoreClassicDnD
}

export interface EditionRuleBx extends EditionRuleBase {
  edition: 'bx'
  mechanics: MechanicsClassicDnD
  lore: LoreClassicDnD
}

export interface EditionRuleHolmes extends EditionRuleBase {
  edition: 'b'
  mechanics: MechanicsHolmes
  lore: LoreHolmes
}

export interface EditionRuleOdd extends EditionRuleBase {
  edition: 'odd'
  mechanics: MechanicsOdd
  lore: LoreHolmes
}

export interface EditionRule3e extends EditionRuleBase {
  edition: '3e'
  mechanics: MechanicsD20
  lore: LoreD20
}

export interface EditionRule35e extends EditionRuleBase {
  edition: '3.5e'
  mechanics: MechanicsD20
  lore: LoreD20
}

export interface EditionRule4e extends EditionRuleBase {
  edition: '4e'
  mechanics: Mechanics4e
  lore: Lore4e
}

export type EditionRule = EditionRule1e | EditionRule2e | EditionRule5e | EditionRuleBecmi | EditionRuleBx | EditionRuleHolmes | EditionRuleOdd | EditionRule3e | EditionRule35e | EditionRule4e

// ---------------------------------------------------------------------------
// Monster (top-level)
// ---------------------------------------------------------------------------

export interface Monster {
  id: string
  name: string
  description?: {
    short?: string
    long?: string
  }
  type: string
  subtype?: string
  sizeCategory?: string
  languages?: string[]
  vision?: string
  diet?: string[]
  setting?: SettingId[]
  editionRules: EditionRule[]
}
