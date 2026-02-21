import type { Mechanics1e } from "./shared.types"
import type { EditionRuleBase } from "../editionRule.types"
import type { LoreBase } from "../shared/monster.types"

export interface Lore1e extends LoreBase {
  xpPerHp?: number
  numberAppearing?: { min: number; max: number }
  percentInLair?: number
  frequency?: string
  treasureType?: string | { individual?: string; lair?: string }
  intelligence?: string
  size?: string
}

export interface EditionRule1e extends EditionRuleBase {
  edition: '1e'
  mechanics: Mechanics1e
  lore: Lore1e
}