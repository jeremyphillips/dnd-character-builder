import type {
  EncounterLightingLevel,
  EncounterVisibilityObscured,
  EncounterWorldCellEnvironment,
} from '../environment/environment.types'

/**
 * Optional senses for perception resolution. Omitted flags mean “not available” for this pass.
 * Future: load from combatant stats / effects / equipment.
 */
export type EncounterViewerPerceptionCapabilities = {
  /** E.g. 60 — does not penetrate magical darkness unless combined with other senses. */
  darkvisionRangeFt?: number
  /** Within range, typically ignores non-magical obscurement (rules vary by table). */
  blindsightRangeFt?: number
  truesightActive?: boolean
  /** Warlock Devil’s Sight — see normally in darkness including magical darkness. */
  devilsSightActive?: boolean
  /** Explicit bypass for magical darkness (if rules grant it outside the above). */
  magicalDarknessBypass?: boolean
}

/**
 * What a **viewer** can perceive about a **target cell** — derived, not stored world state.
 * Distinct from {@link EncounterWorldCellEnvironment} (objective grid environment).
 */
export type EncounterViewerPerceptionCell = {
  /** Whether the viewer can meaningfully perceive the cell as a tactical location (outline / “there is a cell”). */
  canPerceiveCell: boolean
  /** Whether occupants (tokens) can be perceived in this cell. */
  canPerceiveOccupants: boolean
  /** Whether grid objects/obstacles in this cell can be perceived. */
  canPerceiveObjects: boolean
  /**
   * Combined masking from **heavy obscurement** (fog-class) or **ordinary environmental darkness** that was
   * not mitigated by darkvision. Legacy name — internal resolution splits heavy vs ordinary darkness.
   */
  maskedByDarkness: boolean
  /**
   * True only when ordinary environmental darkness was mitigated for this viewer by darkvision (within range,
   * not blocked by `blocksDarkvision`). Drives viewer-relative presentation world adjustment — not world truth.
   */
  environmentalDarknessMitigatedByDarkvision: boolean
  /**
   * True when this cell’s contents are resolved as fully perceivable because **blindsight** applies (within
   * `blindsightRangeFt`). Drives viewer-relative presentation adjustment (clears fog/darkness/MD tints for that
   * cell) — not world truth.
   */
  perceivedByBlindsight: boolean
  /** Magical darkness blocks sight into this cell (when viewer has no bypass). */
  maskedByMagicalDarkness: boolean
  /**
   * When true, AoE/darkness template boundaries for this viewer should be de-emphasized or hidden
   * (e.g. viewer stands inside magical darkness).
   */
  suppressTemplateBoundary: boolean
  worldLightingLevel: EncounterLightingLevel
  worldVisibilityObscured: EncounterVisibilityObscured
  /** Echo of resolved zones on the target cell (debug / tooling). */
  appliedZoneIds: string[]
}

/**
 * Viewer-wide perception mode for battlefield UI (veils, boundary drawing). Derived only from the
 * viewer’s cell {@link EncounterWorldCellEnvironment} — not spell ids.
 *
 * **Immersed-obscuration rule (PC):** When the viewer stands in **heavy obscurement** (e.g. opaque cloud
 * profile) or **magical darkness** (no bypass), {@link suppressDarknessBoundaryFromInside} is true.
 * Downstream projection exposes `suppressAoeTemplateOverlay` on the battlefield render state (historical
 * name) so the grid selector can strip **world-space tactical overlays** that would trace the
 * same obscuring footprint (synced persistent aura fill, AoE placement template tint). **Per-cell** visibility
 * tints still come only from the canonical visibility / perception pipeline — this flag does not replace
 * that system.
 *
 * **DM:** Omniscient tactical view — both immersion flags are reported as false here so overlays stay visible;
 * see `resolveViewerBattlefieldPerception` / `projectBattlefieldRenderState`.
 */
export type EncounterViewerBattlefieldPerception = {
  viewerCellId: string | null
  viewerInsideMagicalDarkness: boolean
  viewerInsideHeavyObscurement: boolean
  /**
   * Full-grid black veil when the viewer’s cell is in magical darkness (no bypass). Heavy obscurement
   * (e.g. Fog Cloud) uses per-cell fog fill only — no second full-grid layer.
   */
  useBattlefieldBlindVeil: boolean
  /**
   * True when the PC viewer is **immersed** in heavy obscurement or magical darkness (no bypass): hide
   * world-space overlays that reveal the obscuring volume footprint from the inside. Drives grid stripping of
   * `persistentAttachedAura` / `aoeInTemplate` (see `selectGridViewModel`). Distinct from per-cell fills.
   */
  suppressDarknessBoundaryFromInside: boolean
}

export type ResolveViewerPerceptionForCellParams = {
  viewerWorld: EncounterWorldCellEnvironment
  targetWorld: EncounterWorldCellEnvironment
  viewerCellId: string
  targetCellId: string
  capabilities?: EncounterViewerPerceptionCapabilities
  /**
   * Grid distance (ft) from viewer cell to target cell. When omitted, darkvision range check is permissive
   * (treated in range if darkvision applies) — matches no-grid / permissive call sites.
   */
  distanceViewerToTargetFt?: number
  /** When `'dm'`, perception is not restricted (tactical omniscience for the view). */
  viewerRole?: 'dm' | 'pc'
}

export type ResolveViewerBattlefieldPerceptionParams = {
  viewerWorld: EncounterWorldCellEnvironment
  viewerCellId: string | undefined
  capabilities?: EncounterViewerPerceptionCapabilities
  viewerRole?: 'dm' | 'pc'
}
