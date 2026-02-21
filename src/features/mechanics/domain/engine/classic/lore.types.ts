import type { LoreBase } from "../../edition/shared/monster.types"

export interface LoreClassicDnD extends LoreBase {
  numberAppearing?: { wandering: string; lair: string } // dice expressions
  treasureType?: string
  intelligence?: string
}