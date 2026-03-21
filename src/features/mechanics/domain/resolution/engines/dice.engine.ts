export type ParsedDamageExpression =
  | { kind: 'flat'; value: number }
  | { kind: 'dice'; count: number; die: number; modifier: number; expression: string }

export function rollDie(sides: number, rng: () => number): number {
  return Math.floor(rng() * sides) + 1
}

export function parseDamageExpression(input?: string): ParsedDamageExpression | null {
  if (!input) return null

  const trimmed = input.trim()
  if (trimmed.length === 0 || trimmed === '—' || trimmed === '-') return null

  if (/^\d+$/.test(trimmed)) {
    return { kind: 'flat', value: Number(trimmed) }
  }

  const normalized = trimmed.replace(/\s+/g, '')
  const match = normalized.match(/^(\d+)d(\d+)([+-]\d+)?$/i)
  if (!match) return null

  return {
    kind: 'dice',
    count: Number(match[1]),
    die: Number(match[2]),
    modifier: match[3] ? Number(match[3]) : 0,
    expression: trimmed,
  }
}

function rollExpression(
  input: string | undefined,
  rng: () => number,
  label: string,
): { total: number; details: string } | null {
  const parsed = parseDamageExpression(input)
  if (!parsed) return null

  if (parsed.kind === 'flat') {
    return {
      total: parsed.value,
      details: `${label}: ${parsed.value}.`,
    }
  }

  const rolls = Array.from({ length: parsed.count }, () => rollDie(parsed.die, rng))
  const diceTotal = rolls.reduce((sum, value) => sum + value, 0)
  const total = Math.max(0, diceTotal + parsed.modifier)
  const modifierText =
    parsed.modifier === 0 ? '' : parsed.modifier > 0 ? ` + ${parsed.modifier}` : ` - ${Math.abs(parsed.modifier)}`

  return {
    total,
    details: `${label}: ${parsed.expression} -> [${rolls.join(', ')}]${modifierText} = ${total}.`,
  }
}

export function rollDamage(
  input: string | undefined,
  rng: () => number,
  options?: { critical?: boolean },
): { total: number; details: string } | null {
  if (!options?.critical) return rollExpression(input, rng, 'Damage')

  const parsed = parseDamageExpression(input)
  if (!parsed) return null

  if (parsed.kind === 'flat') {
    return { total: parsed.value, details: `Critical damage: ${parsed.value}.` }
  }

  const doubledCount = parsed.count * 2
  const rolls = Array.from({ length: doubledCount }, () => rollDie(parsed.die, rng))
  const diceTotal = rolls.reduce((sum, value) => sum + value, 0)
  const total = Math.max(0, diceTotal + parsed.modifier)
  const modifierText =
    parsed.modifier === 0 ? '' : parsed.modifier > 0 ? ` + ${parsed.modifier}` : ` - ${Math.abs(parsed.modifier)}`

  return {
    total,
    details: `Critical damage: ${doubledCount}d${parsed.die}${modifierText === '' ? '' : modifierText} -> [${rolls.join(', ')}]${modifierText} = ${total}.`,
  }
}

export function rollHealing(
  input: string | undefined,
  rng: () => number,
): { total: number; details: string } | null {
  return rollExpression(input, rng, 'Healing')
}

// ---------------------------------------------------------------------------
// d20 + advantage / disadvantage (single implementation for encounter + spells)
// ---------------------------------------------------------------------------

/** Resolved roll mode after combining sources (5e: advantage + disadvantage → normal). */
export type D20RollMode = 'advantage' | 'disadvantage' | 'normal'

/**
 * Combine any number of advantage/disadvantage flags (e.g. from conditions, markers).
 * If both appear, they cancel and the roll is normal.
 */
export function resolveD20RollMode(modifiers: ReadonlyArray<string>): D20RollMode {
  const hasAdv = modifiers.includes('advantage')
  const hasDisadv = modifiers.includes('disadvantage')
  if (hasAdv && hasDisadv) return 'normal'
  if (hasAdv) return 'advantage'
  if (hasDisadv) return 'disadvantage'
  return 'normal'
}

/**
 * Roll a single d20, or two d20s and take the higher (advantage) or lower (disadvantage).
 * Use with {@link resolveD20RollMode} so all paths share the same math.
 */
export function rollD20WithRollMode(
  mode: D20RollMode,
  rng: () => number,
): { rawRoll: number; detail: string } {
  if (mode === 'normal') {
    const rawRoll = rollDie(20, rng)
    return { rawRoll, detail: `d20 ${rawRoll}` }
  }
  const roll1 = rollDie(20, rng)
  const roll2 = rollDie(20, rng)
  const rawRoll = mode === 'advantage' ? Math.max(roll1, roll2) : Math.min(roll1, roll2)
  return {
    rawRoll,
    detail: `d20 ${roll1}, ${roll2} (${mode}: ${rawRoll})`,
  }
}
