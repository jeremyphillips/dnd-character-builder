import type { MechanicsHolmes } from "./shared.types"
import type { LoreHolmes } from "./shared.types"
import type { EditionRuleBase } from "../editionRule.types"

export interface EditionRuleHolmes extends EditionRuleBase {
  edition: 'b'
  mechanics: MechanicsHolmes
  lore: LoreHolmes
}