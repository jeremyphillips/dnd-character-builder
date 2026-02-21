import type { EditionRuleBase } from "../editionRule.types"
import type { MechanicsClassicDnD } from "../../engine/classic/mechanics.types"
import type { LoreClassicDnD } from "../../engine/classic/lore.types"

export interface EditionRuleBecmi extends EditionRuleBase {
  edition: 'becmi'
  mechanics: MechanicsClassicDnD
  lore: LoreClassicDnD
}