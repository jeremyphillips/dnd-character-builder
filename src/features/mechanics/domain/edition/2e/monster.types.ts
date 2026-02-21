import type { Mechanics2e } from './shared.types'
import type { LoreBase } from "../shared/monster.types"
import type { EditionRuleBase } from "../editionRule.types"

export interface Lore2e extends LoreBase {
  frequency?: string
  organization?: string
  treasureType?: string
  intelligence?: string
}

export interface EditionRule2e extends EditionRuleBase {
  edition: '2e'
  mechanics: Mechanics2e
  lore: Lore2e
}