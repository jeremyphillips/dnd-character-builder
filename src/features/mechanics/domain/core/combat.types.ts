export type Attack = {
  name: string
  dice: string
  damageType?: string
  saveEffect?: { ability: string; dc: number }
}

export type Movement = {
  ground?: number
  fly?: number
  swim?: number
  burrow?: number
}

export interface CoreMechanics {
  hitDice: number
  hitDieSize: number
  armorClass: number
  hpAverage: number
  attackBonus: number
  attacks: Attack[]
  movement: Movement
  specialDefenses?: string[]
}