import type { EditionRuleBase } from "../editionRule.types"
import type { MechanicsD20 } from "../../engine/d20/mechanics.types"
import type { LoreD20 } from "../../engine/d20/lore.types"

export interface EditionRule35e extends EditionRuleBase {
  edition: '3.5e'
  mechanics: MechanicsD20
  lore: LoreD20
}