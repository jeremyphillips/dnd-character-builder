/**
 * Canonical **family + variant** registry for authored map cell fills (terrain / surface paint).
 * Persistence stores `{ familyId, variantId }` per cell — not flat composite ids.
 *
 * @see resolveCellFillVariant — delegates to resolveFamilyVariant (registry invariant: defaultVariantId ∈ variants).
 */
import type {
  FamilyWithVariants,
  ResolvedFamilyVariant,
} from '@/shared/domain/registry/familyVariantResolve';
import { resolveFamilyVariant } from '@/shared/domain/registry/familyVariantResolve';

import type { LocationCellFillCategory } from './locationMapCellFill.facets';
import type { LocationScaleId } from '../location.types';
import { isValidLocationScaleId } from '../scale/locationScale.rules';

/** All swatch keys used by cell-fill variants (theme: `mapColors.baseMapSwatchColors`). */
export const AUTHORED_CELL_FILL_SWATCH_KEYS = [
  'cellFillMountains',
  'cellFillPlains',
  'cellFillForestLight',
  'cellFillForestHeavy',
  'cellFillSwamp',
  'cellFillDesert',
  'cellFillWater',
  'cellFillWaterDeep',
  'cellFillStoneFloor',
  'cellFillWoodFloor',
] as const;

export type AuthoredCellFillSwatchColorKey = (typeof AUTHORED_CELL_FILL_SWATCH_KEYS)[number];

export type AuthoredCellFillVariantPresentation = Record<string, string | number | boolean | undefined>;

export type AuthoredCellFillVariantDefinition = {
  label: string;
  description?: string;
  swatchColorKey: AuthoredCellFillSwatchColorKey;
  /**
   * Optional fill texture; same convention as system monsters (`/assets/system/...`).
   * Resolved with `resolveImageUrl` in the map grid; swatch remains the base/fallback color.
   */
  imageKey?: string;
  presentation?: AuthoredCellFillVariantPresentation;
};

export type AuthoredCellFillFamilyDefinition = {
  category: LocationCellFillCategory;
  allowedScales: readonly LocationScaleId[];
  defaultVariantId: string;
  variants: Record<string, AuthoredCellFillVariantDefinition>;
};

export const AUTHORED_CELL_FILL_DEFINITIONS = {
  plains: {
    category: 'terrain',
    allowedScales: ['world', 'city'],
    defaultVariantId: 'temperate_open',
    variants: {
      temperate_open: {
        label: 'Plains',
        description: 'Open grassland or steppe.',
        swatchColorKey: 'cellFillPlains',
        presentation: { biome: 'temperate', vegetation: 'grassland', density: 'open' },
      },
    },
  },
  forest: {
    category: 'terrain',
    allowedScales: ['world', 'city'],
    defaultVariantId: 'temperate_open',
    variants: {
      temperate_open: {
        label: 'Light forest',
        description: 'Sparse or young woodland.',
        swatchColorKey: 'cellFillForestLight',
        presentation: { biome: 'temperate', density: 'open' },
      },
      temperate_dense: {
        label: 'Dense forest',
        description: 'Thick canopy or old growth.',
        swatchColorKey: 'cellFillForestHeavy',
        presentation: { biome: 'temperate', density: 'dense' },
      },
    },
  },
  mountains: {
    category: 'terrain',
    allowedScales: ['world', 'city'],
    defaultVariantId: 'rocky',
    variants: {
      rocky: {
        label: 'Mountains',
        description: 'High, rugged terrain.',
        swatchColorKey: 'cellFillMountains',
        presentation: { surface: 'rocky', elevation: 'high' },
      },
    },
  },
  swamp: {
    category: 'terrain',
    allowedScales: ['world', 'city'],
    defaultVariantId: 'marsh',
    variants: {
      marsh: {
        label: 'Swamp',
        description: 'Wetland, marsh, or bayou.',
        swatchColorKey: 'cellFillSwamp',
      },
    },
  },
  desert: {
    category: 'terrain',
    allowedScales: ['world', 'city'],
    defaultVariantId: 'sand',
    variants: {
      sand: {
        label: 'Desert',
        description: 'Arid sand or scrub.',
        swatchColorKey: 'cellFillDesert',
        presentation: { biome: 'arid' },
      },
    },
  },
  water: {
    category: 'terrain',
    allowedScales: ['world', 'city'],
    defaultVariantId: 'shallow',
    variants: {
      shallow: {
        label: 'Water',
        description: 'Sea, lake, or shallows.',
        swatchColorKey: 'cellFillWater',
        presentation: { depth: 'shallow' },
      },
      deep: {
        label: 'Deep water',
        description: 'Darker deep water.',
        swatchColorKey: 'cellFillWaterDeep',
        presentation: { depth: 'deep' },
      },
    },
  },
  floor: {
    category: 'surface',
    allowedScales: ['floor', 'city'],
    defaultVariantId: 'stone',
    variants: {
      stone: {
        label: 'Stone floor',
        description: 'Interior stone or tile flooring.',
        swatchColorKey: 'cellFillStoneFloor',
        imageKey: '/assets/system/locations/fills/floor-stone.png',
        presentation: { material: 'stone' },
      },
      wood: {
        label: 'Wood floor',
        description: 'Interior wood flooring.',
        swatchColorKey: 'cellFillWoodFloor',
        imageKey: '/assets/system/locations/fills/floor-wood.png',
        presentation: { material: 'wood' },
      },
    },
  },
} as const satisfies Record<string, AuthoredCellFillFamilyDefinition>;

export type LocationCellFillFamilyId = keyof typeof AUTHORED_CELL_FILL_DEFINITIONS;

const FAMILY_IDS = Object.keys(AUTHORED_CELL_FILL_DEFINITIONS) as LocationCellFillFamilyId[];

export const LOCATION_CELL_FILL_FAMILY_IDS: readonly LocationCellFillFamilyId[] = FAMILY_IDS;

/**
 * Cell-fill families whose registry `allowedScales` includes `scale` (same idea as
 * {@link getPlacedObjectKindsForScale} for placed objects). Order: alphabetical by `familyId`.
 *
 * Visual tokens (swatch keys, textures) remain separate — this only gates palette membership by scale.
 */
export function getCellFillFamiliesForScale(scale: LocationScaleId): readonly LocationCellFillFamilyId[] {
  if (!isValidLocationScaleId(scale)) return [];
  const out: LocationCellFillFamilyId[] = [];
  for (const id of LOCATION_CELL_FILL_FAMILY_IDS) {
    const allowed = AUTHORED_CELL_FILL_DEFINITIONS[id].allowedScales as readonly LocationScaleId[];
    if (allowed.includes(scale)) {
      out.push(id);
    }
  }
  out.sort((a, b) => a.localeCompare(b));
  return out;
}

export function getAuthoredCellFillFamilyDefinition(
  familyId: LocationCellFillFamilyId,
): AuthoredCellFillFamilyDefinition {
  return AUTHORED_CELL_FILL_DEFINITIONS[familyId];
}

/**
 * Resolves family-scoped variant id to the canonical variant row (invalid / missing → default).
 */
export function resolveCellFillVariant(
  familyId: LocationCellFillFamilyId,
  requestedVariantId: string | null | undefined,
): ResolvedFamilyVariant<AuthoredCellFillVariantDefinition> {
  const family = AUTHORED_CELL_FILL_DEFINITIONS[familyId] as FamilyWithVariants<AuthoredCellFillVariantDefinition>;
  return resolveFamilyVariant(family, requestedVariantId);
}

export function isCellFillFamilyAllowedOnScale(
  familyId: LocationCellFillFamilyId,
  scale: LocationScaleId,
): boolean {
  const allowed = AUTHORED_CELL_FILL_DEFINITIONS[familyId].allowedScales as readonly LocationScaleId[];
  return allowed.includes(scale);
}
