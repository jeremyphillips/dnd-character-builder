import type { Character } from '@/shared/types'
import type { Effect } from '@/features/mechanics/domain/effects/effects.types'
import { classes } from '@/data'

type FeatureRecord = Record<string, unknown>

function isEffectLike(obj: FeatureRecord): boolean {
  return typeof obj.kind === 'string'
}

/**
 * Recursively extract Effect objects from a subclass feature tree.
 *
 * A feature node can:
 *  - BE an effect itself (has `kind`) — push it
 *  - CONTAIN nested `.effects[]` — push each
 *  - CONTAIN nested `.features[]` — recurse
 *
 * Level-gated features are filtered by clsLevel.
 */
function extractEffects(node: FeatureRecord, clsLevel: number, out: Effect[]): void {
  const featureLevel = typeof node.level === 'number' ? node.level : 0
  if (featureLevel > clsLevel) return

  if (isEffectLike(node)) {
    out.push(node as unknown as Effect)
  }

  if (Array.isArray(node.effects)) {
    for (const e of node.effects as unknown[]) {
      if (e && typeof e === 'object' && isEffectLike(e as FeatureRecord)) {
        out.push(e as Effect)
      }
    }
  }

  if (Array.isArray(node.features)) {
    for (const child of node.features as FeatureRecord[]) {
      extractEffects(child, clsLevel, out)
    }
  }
}

/**
 * Convert base class proficiency entries (class.proficiencies[edition])
 * into GrantEffects so they flow through the engine alongside subclass grants.
 */
function collectBaseProficiencyEffects(character: Character): Effect[] {
  const effects: Effect[] = []
  const edition = character.edition ?? '5e'

  for (const cls of character.classes ?? []) {
    const classDef = classes.find((c) => c.id === cls.classId)
    if (!classDef) continue

    const profs = classDef.proficiencies
    if (Array.isArray(profs)) continue

    const editionProfs = profs[edition]
    if (!editionProfs) continue

    const slots = ['weapons', 'armor'] as const
    const targetMap = { weapons: 'weapon', armor: 'armor' } as const

    for (const slot of slots) {
      const entries = editionProfs[slot]
      if (!entries || !Array.isArray(entries)) continue

      const categories: string[] = []
      const items: string[] = []
      for (const entry of entries) {
        if (entry.categories) categories.push(...entry.categories)
        if (entry.items) items.push(...entry.items)
      }

      if (categories.length > 0 || items.length > 0) {
        effects.push({
          kind: 'grant',
          grantType: 'proficiency',
          value: [{ target: targetMap[slot], categories, items }],
          source: `class:${cls.classId}`,
        } as Effect)
      }
    }
  }

  return effects
}

/**
 * Collect effects from character's class and subclass features.
 * Returns all effect kinds (modifier, formula, grant, etc.) — not filtered by target.
 */
function collectClassEffects(character: Character): Effect[] {
  const effects: Effect[] = []
  const edition = character.edition ?? '5e'

  for (const cls of character.classes ?? []) {
    const classDef = classes.find((c) => c.id === cls.classId)
    if (!classDef) continue

    const def = classDef.definitions?.find(
      (d) => d.edition === edition && (d.id === cls.classDefinitionId || !cls.classDefinitionId)
    )
    const defToUse = def ?? classDef.definitions?.[0]
    if (!defToUse?.options) continue

    const subclass = defToUse.options.find(
      (o) => o.id === cls.classDefinitionId ||
        (typeof o === 'object' && (o as { id?: string }).id === cls.classDefinitionId)
    )
    const sub = typeof subclass === 'object' && subclass && 'features' in subclass
      ? (subclass as { features?: FeatureRecord[] })
      : null

    if (sub?.features) {
      const clsLevel = cls.level ?? character.totalLevel ?? 1
      for (const feat of sub.features) {
        extractEffects(feat, clsLevel, effects)
      }
    }
  }

  return effects
}

function collectRaceEffects(_character: Character): Effect[] {
  return []
}

function collectActiveBuffsEffects(_character: Character): Effect[] {
  return []
}

function collectConditionsEffects(_character: Character): Effect[] {
  return []
}

/**
 * Gather intrinsic effects from a character: class, race, buffs, conditions.
 *
 * Equipment effects are handled separately via
 * getEquipmentEffects → selectActiveEquipmentEffects.
 */
export function collectIntrinsicEffects(character: Character): Effect[] {
  return [
    ...collectBaseProficiencyEffects(character),
    ...collectClassEffects(character),
    ...collectRaceEffects(character),
    ...collectActiveBuffsEffects(character),
    ...collectConditionsEffects(character),
  ]
}
