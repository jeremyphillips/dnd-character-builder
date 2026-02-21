import type { MechanicsOdd } from "./shared.types"
import type { LoreHolmes } from "../holmes/shared.types"
import type { EditionRuleBase } from "../editionRule.types"

export interface EditionRuleOdd extends EditionRuleBase {
  edition: 'odd'
  mechanics: MechanicsOdd
  lore: LoreHolmes
}