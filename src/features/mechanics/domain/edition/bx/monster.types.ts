import type { EditionRuleBase } from "../editionRule.types"
import type { MechanicsClassicDnD } from "../../engine/classic/mechanics.types"
import type { LoreClassicDnD } from "../../engine/classic/lore.types" 

export interface EditionRuleBx extends EditionRuleBase {
  edition: 'bx'
  mechanics: MechanicsClassicDnD
  lore: LoreClassicDnD
}