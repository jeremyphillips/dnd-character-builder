import type { MechanicsHolmes } from "../holmes/shared.types"

export type MechanicsOdd = MechanicsHolmes & {
  hitDieSize: number // 6 for original LBBs (1974); 8 for post-Greyhawk (1975)
}
