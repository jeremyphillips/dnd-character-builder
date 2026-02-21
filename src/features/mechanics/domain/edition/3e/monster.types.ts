import type { EditionRuleBase } from "../editionRule.types"
import type { MechanicsD20 } from "../../engine/d20/mechanics.types"
import type { LoreD20 } from "../../engine/d20/lore.types"

export interface EditionRule3e extends EditionRuleBase {
  edition: '3e'
  mechanics: MechanicsD20
  lore: LoreD20
}