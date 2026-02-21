import type { Mechanics5e } from "./shared.types"
import type { LoreBase } from "../shared/monster.types"
import type { EditionRuleBase } from "../editionRule.types"

export interface Lore5e extends LoreBase {
  challengeRating: number
  intelligence?: string
}

export interface EditionRule5e extends EditionRuleBase {
  edition: '5e'
  mechanics: Mechanics5e
  lore: Lore5e
}