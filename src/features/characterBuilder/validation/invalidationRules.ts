/**
 * Declarative invalidation rules.
 *
 * Each rule describes a downstream dependency:
 *   "when field(s) X change, check if data Y is still valid"
 *
 * Adding a new rule is the only change needed to extend the system to
 * cover new steps or fields.
 */
import type { InvalidationRule } from './types'
import type { CharacterBuilderState } from '../types'
import type { EditionId } from '@/data'

import { getOptions } from '@/domain/options'
import { classes as classCatalog, races as raceCatalog, equipment } from '@/data'
import type { AlignmentId } from '@/data'
import { spells as spellCatalog } from '@/data/classes/spells'
import { getClassProgression, getClassRequirement, getAlignmentsByEdition } from '@/domain/character'
import { getAvailableSpells, getSpellLimits } from '@/domain/spells'
import { resolveEquipmentEdition } from '@/domain/equipment'
import { getById } from '@/domain/lookups'

const { weapons: weaponsData, armor: armorData, gear: gearData } = equipment

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Resolve a spell ID to its display name. */
function spellName(id: string): string {
  const spell = spellCatalog.find(s => s.id === id)
  return spell?.name ?? id
}

/** Resolve a weapon ID to its display name. */
function weaponName(id: string): string {
  return getById(weaponsData, id)?.name ?? id
}

/** Resolve an armor ID to its display name. */
function armorName(id: string): string {
  return getById(armorData, id)?.name ?? id
}

/** Resolve a gear ID to its display name. */
function gearName(id: string): string {
  return getById(gearData, id)?.name ?? id
}

/** Resolve a class ID to its display name. */
function className(id: string): string {
  return getById(classCatalog, id)?.name ?? id
}

/** Resolve a race ID to its display name. */
function raceName(id: string): string {
  return getById(raceCatalog, id)?.name ?? id
}

/** Check whether an equipment item has data for a given edition. */
function itemHasEdition(
  items: readonly { id: string; editionData: { edition: string }[] }[],
  itemId: string,
  edition: string
): boolean {
  const item = items.find(i => i.id === itemId)
  if (!item) return false
  return item.editionData.some(d => d.edition === edition)
}

/**
 * Compute per-level spell limits for the given state.
 * Returns { perLevelMax, maxSpellLevel, totalKnown } identical to SpellStep's logic.
 */
function computeSpellLimits(state: CharacterBuilderState) {
  const perLevelMax = new Map<number, number>()
  let maxSpellLevel = 0
  let totalKnown = 0

  if (!state.edition) return { perLevelMax, maxSpellLevel, totalKnown }

  for (const cls of state.classes) {
    if (!cls.classId) continue
    const prog = getClassProgression(cls.classId, state.edition)
    if (!prog?.spellProgression) continue

    const limits = getSpellLimits(prog, cls.level)
    if (limits.cantrips > 0) {
      perLevelMax.set(0, (perLevelMax.get(0) ?? 0) + limits.cantrips)
    }
    for (let i = 0; i < limits.slotsByLevel.length; i++) {
      const spellLevel = i + 1
      if (limits.slotsByLevel[i] > 0) {
        perLevelMax.set(spellLevel, (perLevelMax.get(spellLevel) ?? 0) + limits.slotsByLevel[i])
      }
    }
    maxSpellLevel = Math.max(maxSpellLevel, limits.maxSpellLevel)
    totalKnown += limits.totalKnown
  }

  return { perLevelMax, maxSpellLevel, totalKnown }
}

/**
 * Build a set of available spell IDs + a level map for a given state.
 */
function getAvailableSpellsForState(state: CharacterBuilderState) {
  const availableIds = new Set<string>()
  const spellLevelMap = new Map<string, number>()

  if (!state.edition) return { availableIds, spellLevelMap }

  for (const cls of state.classes) {
    if (!cls.classId) continue
    for (const s of getAvailableSpells(cls.classId, state.edition)) {
      availableIds.add(s.spell.id)
      spellLevelMap.set(s.spell.id, s.entry.level)
    }
  }

  return { availableIds, spellLevelMap }
}

/**
 * Detect which spells would be invalidated in the proposed next state.
 * Mirrors the pruning logic from SpellStep but is pure / stateless.
 */
function detectInvalidSpells(
  _prev: CharacterBuilderState,
  next: CharacterBuilderState
): string[] {
  const selected = next.spells ?? []
  if (selected.length === 0) return []

  const { availableIds, spellLevelMap } = getAvailableSpellsForState(next)
  const { perLevelMax, maxSpellLevel, totalKnown } = computeSpellLimits(next)

  const removed: string[] = []
  const keptPerLevel = new Map<number, number>()
  let keptLeveledCount = 0

  for (const id of selected) {
    const level = spellLevelMap.get(id)

    // Spell no longer in catalog for this edition/class combo
    if (level === undefined || !availableIds.has(id)) {
      removed.push(spellName(id))
      continue
    }
    // Spell level exceeds max
    if (level > 0 && level > maxSpellLevel) {
      removed.push(spellName(id))
      continue
    }
    // Cantrips no longer granted
    if (level === 0 && (perLevelMax.get(0) ?? 0) === 0) {
      removed.push(spellName(id))
      continue
    }
    // Per-level slot cap
    const max = perLevelMax.get(level) ?? 0
    const currentCount = keptPerLevel.get(level) ?? 0
    if (max > 0 && currentCount >= max) {
      removed.push(spellName(id))
      continue
    }
    // Overall known cap (known casters)
    if (level > 0 && totalKnown > 0 && keptLeveledCount >= totalKnown) {
      removed.push(spellName(id))
      continue
    }

    keptPerLevel.set(level, currentCount + 1)
    if (level > 0) keptLeveledCount++
  }

  return removed
}

/**
 * Resolve invalid spells — keep only spells that survive the limits.
 */
function resolveInvalidSpells(
  state: CharacterBuilderState,
  invalidatedNames: string[]
): CharacterBuilderState {
  const invalidSet = new Set(invalidatedNames)
  const kept = (state.spells ?? []).filter(id => !invalidSet.has(spellName(id)))
  return { ...state, spells: kept }
}

// ---------------------------------------------------------------------------
// Rule definitions
// ---------------------------------------------------------------------------

export const INVALIDATION_RULES: InvalidationRule[] = [

  // ── Edition changes ──────────────────────────────────────────────────────

  {
    id: 'edition→race',
    triggers: ['edition'],
    affectedStep: 'race',
    label: 'Race',
    detect: (_prev, next) => {
      if (!next.edition || !next.race) return []
      const allowed = getOptions('races', next.edition as EditionId, next.setting)
      if (allowed.includes(next.race)) return []
      return [raceName(next.race)]
    },
    resolve: (state) => ({ ...state, race: undefined }),
  },

  {
    id: 'edition→class',
    triggers: ['edition'],
    affectedStep: 'class',
    label: 'Classes',
    detect: (_prev, next) => {
      if (!next.edition) return []
      const allowed = new Set(getOptions('classes', next.edition as EditionId, next.setting))
      const invalid: string[] = []
      for (const cls of next.classes) {
        if (cls.classId && !allowed.has(cls.classId)) {
          invalid.push(className(cls.classId))
        }
      }
      return invalid
    },
    resolve: (state, invalidatedNames) => {
      const invalidIds = new Set(
        state.classes
          .filter(cls => cls.classId && invalidatedNames.includes(className(cls.classId)))
          .map(cls => cls.classId)
      )
      // Remove invalid classes; ensure at least the primary class slot remains
      let classes = state.classes.filter(cls => !cls.classId || !invalidIds.has(cls.classId))
      if (classes.length === 0) classes = [{ level: 1 }]
      return { ...state, classes }
    },
  },

  {
    id: 'edition→alignment',
    triggers: ['edition'],
    affectedStep: 'alignment',
    label: 'Alignment',
    detect: (_prev, next) => {
      if (!next.edition || !next.alignment) return []
      const alignments = getAlignmentsByEdition(next.edition as EditionId)
      const validIds = new Set(alignments.map(a => a.id))
      if (validIds.has(next.alignment)) return []
      // Find a readable label for the current alignment
      return [next.alignment]
    },
    resolve: (state) => ({ ...state, alignment: undefined }),
  },

  {
    id: 'edition→spells',
    triggers: ['edition'],
    affectedStep: 'spells',
    label: 'Spells',
    detect: detectInvalidSpells,
    resolve: resolveInvalidSpells,
  },

  {
    id: 'edition→weapons',
    triggers: ['edition'],
    affectedStep: 'equipment',
    label: 'Weapons',
    detect: (_prev, next) => {
      if (!next.edition) return []
      const ids = next.equipment?.weapons ?? []
      if (ids.length === 0) return []
      const eqEdition = resolveEquipmentEdition(next.edition)
      return ids
        .filter(id => !itemHasEdition(weaponsData, id, eqEdition))
        .map(weaponName)
    },
    resolve: (state) => {
      if (!state.edition) return state
      const eqEdition = resolveEquipmentEdition(state.edition)
      const weapons = (state.equipment?.weapons ?? []).filter(
        id => itemHasEdition(weaponsData, id, eqEdition)
      )
      return { ...state, equipment: { ...state.equipment, weapons } }
    },
  },

  {
    id: 'edition→armor',
    triggers: ['edition'],
    affectedStep: 'equipment',
    label: 'Armor',
    detect: (_prev, next) => {
      if (!next.edition) return []
      const ids = next.equipment?.armor ?? []
      if (ids.length === 0) return []
      const eqEdition = resolveEquipmentEdition(next.edition)
      return ids
        .filter(id => !itemHasEdition(armorData, id, eqEdition))
        .map(armorName)
    },
    resolve: (state) => {
      if (!state.edition) return state
      const eqEdition = resolveEquipmentEdition(state.edition)
      const armor = (state.equipment?.armor ?? []).filter(
        id => itemHasEdition(armorData, id, eqEdition)
      )
      return { ...state, equipment: { ...state.equipment, armor } }
    },
  },

  {
    id: 'edition→gear',
    triggers: ['edition'],
    affectedStep: 'equipment',
    label: 'Gear',
    detect: (_prev, next) => {
      if (!next.edition) return []
      const ids = next.equipment?.gear ?? []
      if (ids.length === 0) return []
      const eqEdition = resolveEquipmentEdition(next.edition)
      return ids
        .filter(id => !itemHasEdition(gearData, id, eqEdition))
        .map(gearName)
    },
    resolve: (state) => {
      if (!state.edition) return state
      const eqEdition = resolveEquipmentEdition(state.edition)
      const gear = (state.equipment?.gear ?? []).filter(
        id => itemHasEdition(gearData, id, eqEdition)
      )
      return { ...state, equipment: { ...state.equipment, gear } }
    },
  },

  // ── Setting changes ──────────────────────────────────────────────────────

  {
    id: 'setting→race',
    triggers: ['setting'],
    affectedStep: 'race',
    label: 'Race',
    detect: (_prev, next) => {
      if (!next.edition || !next.race) return []
      const allowed = getOptions('races', next.edition as EditionId, next.setting)
      if (allowed.includes(next.race)) return []
      return [raceName(next.race)]
    },
    resolve: (state) => ({ ...state, race: undefined }),
  },

  {
    id: 'setting→class',
    triggers: ['setting'],
    affectedStep: 'class',
    label: 'Classes',
    detect: (_prev, next) => {
      if (!next.edition) return []
      const allowed = new Set(getOptions('classes', next.edition as EditionId, next.setting))
      const invalid: string[] = []
      for (const cls of next.classes) {
        if (cls.classId && !allowed.has(cls.classId)) {
          invalid.push(className(cls.classId))
        }
      }
      return invalid
    },
    resolve: (state, invalidatedNames) => {
      const invalidIds = new Set(
        state.classes
          .filter(cls => cls.classId && invalidatedNames.includes(className(cls.classId)))
          .map(cls => cls.classId)
      )
      let classes = state.classes.filter(cls => !cls.classId || !invalidIds.has(cls.classId))
      if (classes.length === 0) classes = [{ level: 1 }]
      return { ...state, classes }
    },
  },

  // ── Level changes ────────────────────────────────────────────────────────

  {
    id: 'level→multiclass',
    triggers: ['totalLevel'],
    affectedStep: 'class',
    label: 'Multiclass allocations',
    detect: (prev, next) => {
      // Only relevant when level decreases
      if ((next.totalLevel ?? 0) >= (prev.totalLevel ?? 0)) return []

      const budget = next.totalLevel ?? 0
      const invalid: string[] = []
      let remaining = budget

      for (let i = 0; i < prev.classes.length; i++) {
        const cls = prev.classes[i]
        const min = i === 0 ? 1 : 0
        const clamped = Math.max(min, Math.min(cls.level, remaining))
        remaining -= clamped

        // Secondary class gets 0 levels → dropped entirely
        if (i > 0 && clamped === 0 && cls.classId) {
          invalid.push(className(cls.classId))
        }
      }

      return invalid
    },
    resolve: (state) => {
      // The actual clamping is already handled by setTotalLevels in the provider.
      // This rule only needs to detect the invalidation for user confirmation;
      // the resolve just ensures the classes array is consistent.
      let budget = state.totalLevel ?? 0
      const classes = state.classes
        .map((cls, i) => {
          const min = i === 0 ? 1 : 0
          const level = Math.max(min, Math.min(cls.level, budget))
          budget -= level
          return { ...cls, level }
        })
        .filter((cls, i) => i === 0 || cls.level > 0)

      return { ...state, classes }
    },
  },

  {
    id: 'level→spells',
    triggers: ['totalLevel', 'classes'],
    affectedStep: 'spells',
    label: 'Spells',
    detect: detectInvalidSpells,
    resolve: resolveInvalidSpells,
  },

  {
    id: 'level→wealth',
    triggers: ['totalLevel'],
    affectedStep: 'equipment',
    label: 'Wealth',
    detect: (prev, next) => {
      // Wealth tables are level-dependent.  If level changed and wealth
      // was already set, the user should be informed it will be recalculated.
      if ((prev.totalLevel ?? 0) === (next.totalLevel ?? 0)) return []
      const hasWealth = (next.wealth?.gp ?? 0) > 0
        || (next.wealth?.sp ?? 0) > 0
        || (next.wealth?.cp ?? 0) > 0
      if (!hasWealth) return []
      return ['Starting gold will be recalculated']
    },
    resolve: (state) => ({
      ...state,
      wealth: { gp: 0, sp: 0, cp: 0, baseGp: 0 },
      // Equipment references stay — only wealth resets so the equipment step
      // can recompute costs against the new wealth base.
    }),
  },

  // ── Class changes ────────────────────────────────────────────────────────

  {
    id: 'class→spells',
    triggers: ['classes'],
    affectedStep: 'spells',
    label: 'Spells',
    detect: detectInvalidSpells,
    resolve: resolveInvalidSpells,
  },

  // ── Race changes ─────────────────────────────────────────────────────────

  {
    id: 'race→class',
    triggers: ['race'],
    affectedStep: 'class',
    label: 'Classes',
    detect: (_prev, next) => {
      if (!next.edition || !next.race) return []

      const invalid: string[] = []
      for (const cls of next.classes) {
        if (!cls.classId) continue
        const req = getClassRequirement(cls.classId, next.edition as EditionId)
        if (!req) continue

        if (req.allowedRaces !== 'all' && !req.allowedRaces.includes(next.race)) {
          invalid.push(className(cls.classId))
        }
      }

      return invalid
    },
    resolve: (state, invalidatedNames) => {
      const invalidIds = new Set(
        state.classes
          .filter(cls => cls.classId && invalidatedNames.includes(className(cls.classId)))
          .map(cls => cls.classId)
      )
      let classes = state.classes.filter(cls => !cls.classId || !invalidIds.has(cls.classId))
      if (classes.length === 0) classes = [{ level: 1 }]
      return { ...state, classes }
    },
  },

  // ── Alignment changes ────────────────────────────────────────────────────

  {
    id: 'alignment→class',
    triggers: ['alignment'],
    affectedStep: 'class',
    label: 'Classes',
    detect: (_prev, next) => {
      if (!next.edition || !next.alignment) return []

      const invalid: string[] = []
      for (const cls of next.classes) {
        if (!cls.classId) continue
        const req = getClassRequirement(cls.classId, next.edition as EditionId)
        if (!req) continue

        if (
          req.allowedAlignments !== 'any' &&
          !req.allowedAlignments.includes(next.alignment as AlignmentId)
        ) {
          invalid.push(className(cls.classId))
        }
      }

      return invalid
    },
    resolve: (state, invalidatedNames) => {
      const invalidIds = new Set(
        state.classes
          .filter(cls => cls.classId && invalidatedNames.includes(className(cls.classId)))
          .map(cls => cls.classId)
      )
      let classes = state.classes.filter(cls => !cls.classId || !invalidIds.has(cls.classId))
      if (classes.length === 0) classes = [{ level: 1 }]
      return { ...state, classes }
    },
  },
]
