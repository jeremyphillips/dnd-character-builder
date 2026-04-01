import { createSquareGridSpace } from '@/features/mechanics/domain/combat/space/creation/createSquareGridSpace'
import { DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE } from '@/features/mechanics/domain/environment/environment.resolve'

import { createEncounterState } from '../state'
import type { CombatantInstance } from '../state/types'
import type { EncounterState } from '../state/types'

export function testPc(id: string, label: string, hp: number): CombatantInstance {
  return {
    instanceId: id,
    side: 'party',
    source: { kind: 'pc', sourceId: id, label },
    stats: {
      armorClass: 14,
      maxHitPoints: hp,
      currentHitPoints: hp,
      initiativeModifier: 0,
      dexterityScore: 14,
    },
    attacks: [],
    actions: [],
    activeEffects: [],
    runtimeEffects: [],
    turnHooks: [],
    conditions: [],
    states: [],
  }
}

/** Party combatant with darkvision 120 ft from `senses.special` (matches monster stat block shape). */
export function testPcWithDarkvision120(id: string, label: string, hp: number): CombatantInstance {
  return {
    ...testPc(id, label, hp),
    senses: { special: [{ type: 'darkvision', range: 120 }] },
  }
}

/** Viewer with blindsight 60 ft and darkvision 120 ft (ordering / fallback tests). */
export function testPcBlindsight60Darkvision120(id: string, label: string, hp: number): CombatantInstance {
  return {
    ...testPc(id, label, hp),
    senses: {
      special: [
        { type: 'blindsight', range: 60 },
        { type: 'darkvision', range: 120 },
      ],
    },
  }
}

export function testEnemy(id: string, label: string, hp: number): CombatantInstance {
  return {
    instanceId: id,
    side: 'enemies',
    source: { kind: 'monster', sourceId: id, label },
    stats: {
      armorClass: 12,
      maxHitPoints: hp,
      currentHitPoints: hp,
      initiativeModifier: 0,
      dexterityScore: 10,
    },
    attacks: [],
    actions: [],
    activeEffects: [],
    runtimeEffects: [],
    turnHooks: [],
    conditions: [],
    states: [],
  }
}

/** Wizard c-0-0, orc c-2-2; orc cell only has heavy obscurement (occupant not perceivable from outside). */
export function encounterAttackerOutsideDefenderHeavilyObscured(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
  const wiz = testPc('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-2-2' },
    ],
    environmentZones: [
      {
        id: 'z-heavy',
        kind: 'patch',
        sourceKind: 'manual',
        area: { kind: 'grid-cell-ids', cellIds: ['c-2-2'] },
        overrides: { visibilityObscured: 'heavy' },
      },
    ],
  }
}

/** Wizard c-0-0, orc c-2-2; orc cell only has magical darkness (same occupant masking as heavy obscurement for outside viewer). */
/** Global ordinary darkness; wizard c-0-0, orc c-2-2 (10 ft on 5 ft grid). */
export function encounterDarknessWizard10ftFromOrc(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
  const wiz = testPcWithDarkvision120('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    environmentBaseline: { ...DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE, lightingLevel: 'darkness' },
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-2-2' },
    ],
  }
}

/** Same as {@link encounterDarknessWizard10ftFromOrc} but orc is 125 ft away (out of 120 ft darkvision). */
export function encounterDarknessWizardOutOfDarkvisionRange(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 30, rows: 8 })
  const wiz = testPcWithDarkvision120('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    environmentBaseline: { ...DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE, lightingLevel: 'darkness' },
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-25-0' },
    ],
  }
}

export function encounterAttackerOutsideDefenderMagicalDarknessCell(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
  const wiz = testPc('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-2-2' },
    ],
    environmentZones: [
      {
        id: 'z-md',
        kind: 'patch',
        sourceKind: 'manual',
        area: { kind: 'grid-cell-ids', cellIds: ['c-2-2'] },
        overrides: { lightingLevel: 'darkness', visibilityObscured: 'heavy' },
        magical: { magical: true, magicalDarkness: true, blocksDarkvision: true },
      },
    ],
  }
}

/** Heavy obscurement on orc cell; viewer has darkvision — fog still blocks (same geometry as heavily obscured fixture). */
export function encounterHeavyObscuredWithDarkvisionViewer(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
  const wiz = testPcWithDarkvision120('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-2-2' },
    ],
    environmentZones: [
      {
        id: 'z-heavy',
        kind: 'patch',
        sourceKind: 'manual',
        area: { kind: 'grid-cell-ids', cellIds: ['c-2-2'] },
        overrides: { visibilityObscured: 'heavy' },
      },
    ],
  }
}

/** Magical darkness on orc cell; viewer has darkvision — still blocked. */
/** Wizard (blindsight 60 / DV 120) c-0-0, orc c-13-0 — 65 ft; global ordinary darkness only. */
export function encounterBlindsightOutOfRangeDarknessInDarkvisionRange(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 30, rows: 8 })
  const wiz = testPcBlindsight60Darkvision120('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    environmentBaseline: { ...DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE, lightingLevel: 'darkness' },
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-13-0' },
    ],
  }
}

/** Wizard (blindsight 60 / DV 120) c-0-0, orc c-2-2 (10 ft); global ordinary darkness. */
export function encounterBlindsightOrdinaryDarkness10ftFromOrc(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
  const wiz = testPcBlindsight60Darkvision120('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    environmentBaseline: { ...DEFAULT_ENCOUNTER_ENVIRONMENT_BASELINE, lightingLevel: 'darkness' },
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-2-2' },
    ],
  }
}

/** Heavy obscurement on orc only; viewer has blindsight + darkvision (10 ft). */
export function encounterHeavyObscuredWithBlindsightViewer(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
  const wiz = testPcBlindsight60Darkvision120('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-2-2' },
    ],
    environmentZones: [
      {
        id: 'z-heavy',
        kind: 'patch',
        sourceKind: 'manual',
        area: { kind: 'grid-cell-ids', cellIds: ['c-2-2'] },
        overrides: { visibilityObscured: 'heavy' },
      },
    ],
  }
}

/** Magical darkness on orc cell; viewer has blindsight + darkvision. */
export function encounterMagicalDarknessWithBlindsightViewer(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
  const wiz = testPcBlindsight60Darkvision120('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-2-2' },
    ],
    environmentZones: [
      {
        id: 'z-md',
        kind: 'patch',
        sourceKind: 'manual',
        area: { kind: 'grid-cell-ids', cellIds: ['c-2-2'] },
        overrides: { lightingLevel: 'darkness', visibilityObscured: 'heavy' },
        magical: { magical: true, magicalDarkness: true, blocksDarkvision: true },
      },
    ],
  }
}

/** Same geometry; orc cell has heavy obscurement (fog). Blindsight 60 ft out; DV 120 ft in — fog still blocks. */
export function encounterBlindsightOutOfRangeHeavyObscuredInDarkvisionRange(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 30, rows: 8 })
  const wiz = testPcBlindsight60Darkvision120('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-13-0' },
    ],
    environmentZones: [
      {
        id: 'z-heavy',
        kind: 'patch',
        sourceKind: 'manual',
        area: { kind: 'grid-cell-ids', cellIds: ['c-13-0'] },
        overrides: { visibilityObscured: 'heavy' },
      },
    ],
  }
}

export function encounterMagicalDarknessWithDarkvisionViewer(): EncounterState {
  const space = createSquareGridSpace({ id: 'm', name: 'M', columns: 8, rows: 8 })
  const wiz = testPcWithDarkvision120('wiz', 'Wizard', 20)
  const orc = testEnemy('orc', 'Orc', 20)
  const base = createEncounterState([wiz, orc], { rng: () => 0.5, space })
  return {
    ...base,
    placements: [
      { combatantId: 'wiz', cellId: 'c-0-0' },
      { combatantId: 'orc', cellId: 'c-2-2' },
    ],
    environmentZones: [
      {
        id: 'z-md',
        kind: 'patch',
        sourceKind: 'manual',
        area: { kind: 'grid-cell-ids', cellIds: ['c-2-2'] },
        overrides: { lightingLevel: 'darkness', visibilityObscured: 'heavy' },
        magical: { magical: true, magicalDarkness: true, blocksDarkvision: true },
      },
    ],
  }
}
