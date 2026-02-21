import type { LoreBase } from "../shared/monster.types"
import type { Mechanics4e } from "./shared.types"
import type { EditionRuleBase } from "../editionRule.types"

export interface Lore4e extends LoreBase {
  origin?: string // Natural, Elemental, Shadow, Fey, Aberrant, Immortal
  intelligence?: string
}

export interface EditionRule4e extends EditionRuleBase {
  edition: '4e'
  mechanics: Mechanics4e
  lore: Lore4e
}