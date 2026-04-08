/**
 * Cross-domain material identifiers, display labels, and optional **reaction** / **structural** hints
 * for future environment/spell interaction and breakage. Domain features (e.g. locations) should take
 * **subsets** of {@link MaterialId} rather than redefining material spellings locally.
 */

import type { ElementId } from '../elements/elements';

/** Canonical material ids — single vocabulary across domains (surfaces, fixtures, props). */
export const MATERIAL_IDS = ['stone', 'wood', 'tile', 'glass'] as const;

export type MaterialId = (typeof MATERIAL_IDS)[number];

/**
 * Optional future-facing hints for how a material interacts with elements (fire, …) and ignition.
 *
 * @remarks **TODO:** spell systems, environmental hazards, and combat do **not** consistently
 * consume these fields yet. No ignition propagation, burn duration, or damage scaling is implied
 * here — only a place to hang simple flags and element references for later wiring.
 */
export type MaterialReactionProfile = {
  /**
   * Whether this material can ignite and sustain combustion in future fire simulation.
   * @remarks **TODO:** not evaluated by gameplay loops in this pass.
   */
  flammable?: boolean;
  /**
   * Elements that can plausibly ignite this material (e.g. `fire` for dry wood).
   * @remarks **TODO:** reserved for spell/environment hooks; unused in runtime today.
   */
  ignitedBy?: readonly ElementId[];
  /**
   * Elements this material is treated as resistant to in future interaction rules.
   * @remarks **TODO:** not applied to damage or saves yet.
   */
  resistantTo?: readonly ElementId[];
  /**
   * Elements this material is treated as vulnerable to in future interaction rules.
   * @remarks **TODO:** not applied to damage or saves yet.
   */
  vulnerableTo?: readonly ElementId[];
};

/**
 * Coarse structural behavior for future combat/object rules (shatter, sunder, environmental stress).
 *
 * @remarks **TODO:** not consumed by gameplay loops in this pass.
 */
export type MaterialBrittleness = 'low' | 'medium' | 'high';

export type MaterialStructuralProfile = {
  brittleness: MaterialBrittleness;
  /**
   * Whether the material can shatter into fragments (glass, brittle ceramic) vs crack/splinter only.
   */
  shatterable: boolean;
};

type MaterialEntry = {
  id: MaterialId;
  label: string;
  /**
   * Future-facing interaction hints (flammability, element ties).
   * @remarks **TODO:** see {@link MaterialReactionProfile}; gameplay may ignore until systems land.
   */
  reactionProfile?: MaterialReactionProfile;
  /**
   * Future-facing structural hints (breakage, brittleness).
   * @remarks **TODO:** see {@link MaterialStructuralProfile}; gameplay may ignore until systems land.
   */
  structuralProfile?: MaterialStructuralProfile;
};

/**
 * Human-readable labels and optional {@link MaterialReactionProfile} / {@link MaterialStructuralProfile}
 * per {@link MaterialId}. Ids are listed explicitly so they stay aligned with {@link MATERIAL_IDS}.
 */
export const MATERIAL_META = {
  stone: {
    id: 'stone',
    label: 'Stone',
    reactionProfile: {
      flammable: false,
    },
  },
  wood: {
    id: 'wood',
    label: 'Wood',
    reactionProfile: {
      flammable: true,
      ignitedBy: ['fire'] as const,
    },
  },
  tile: {
    id: 'tile',
    label: 'Tile',
    reactionProfile: {
      flammable: false,
    },
  },
  glass: {
    id: 'glass',
    label: 'Glass',
    reactionProfile: {
      flammable: false,
    },
    structuralProfile: {
      brittleness: 'high',
      shatterable: true,
    },
  },
} as const satisfies Record<MaterialId, MaterialEntry>;
