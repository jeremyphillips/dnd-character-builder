type WealthTier = {
  /** [minLevel, maxLevel] inclusive; typed as array for compatibility with class requirement data */
  levelRange: number[]
  baseGold: number
  maxItemValue: number
}

export const calculateWealth5e = (
  totalLevel: number,
  startingWealth: {
    useTiers: boolean
    tiers: WealthTier[]
  }
) => {
  if (!startingWealth.useTiers) return null

  const tier = startingWealth.tiers.find(
    t => totalLevel >= t.levelRange[0] && totalLevel <= t.levelRange[1]
  )

  if (!tier) return null

  return {
    gp: tier.baseGold,
    sp: 0,
    cp: 0,
    maxItemValue: tier.maxItemValue
  }
}

export type CalculateWealth5eStartingWealth = Parameters<typeof calculateWealth5e>[1]
