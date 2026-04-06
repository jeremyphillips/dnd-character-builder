// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { AUTHORED_PLACED_OBJECT_DEFINITIONS } from '../locationPlacedObject.registry';
import { recordKeys } from '../locationPlacedObject.recordUtils';
import { LOCATION_PLACED_OBJECT_KIND_RUNTIME_DEFAULTS } from '../locationPlacedObject.runtime';
import {
  getDefaultVariantIdForFamily,
  getPlacedObjectPaletteCategoryId,
  getPlacedObjectVariantPickerRowsForFamily,
  getVariantCountForFamily,
  LOCATION_PLACED_OBJECT_KIND_IDS,
  LOCATION_PLACED_OBJECT_KIND_META,
  normalizeVariantIdForFamily,
} from '../locationPlacedObject.selectors';

describe('locationPlacedObject.selectors (registry-derived)', () => {
  it('LOCATION_PLACED_OBJECT_KIND_IDS matches registry keys (no drift)', () => {
    const fromRegistry = recordKeys(AUTHORED_PLACED_OBJECT_DEFINITIONS).sort();
    const derived = [...LOCATION_PLACED_OBJECT_KIND_IDS].sort();
    expect(derived).toEqual(fromRegistry);
  });

  it('LOCATION_PLACED_OBJECT_KIND_META covers every registry key', () => {
    expect(Object.keys(LOCATION_PLACED_OBJECT_KIND_META).sort()).toEqual(
      recordKeys(AUTHORED_PLACED_OBJECT_DEFINITIONS).sort(),
    );
  });

  it('LOCATION_PLACED_OBJECT_KIND_RUNTIME_DEFAULTS matches registry keys', () => {
    expect(Object.keys(LOCATION_PLACED_OBJECT_KIND_RUNTIME_DEFAULTS).sort()).toEqual(
      recordKeys(AUTHORED_PLACED_OBJECT_DEFINITIONS).sort(),
    );
  });

  it('getPlacedObjectPaletteCategoryId returns family registry category', () => {
    expect(getPlacedObjectPaletteCategoryId('table')).toBe('furniture');
    expect(getPlacedObjectPaletteCategoryId('city')).toBe('structure');
    expect(getPlacedObjectPaletteCategoryId('stairs')).toBe('structure');
    expect(getPlacedObjectPaletteCategoryId('treasure')).toBe('treasure');
  });

  it('every family defaultVariantId is a key of variants', () => {
    for (const k of LOCATION_PLACED_OBJECT_KIND_IDS) {
      const d = AUTHORED_PLACED_OBJECT_DEFINITIONS[k];
      expect(d.variants[d.defaultVariantId]).toBeDefined();
    }
  });

  it('getDefaultVariantIdForFamily and getVariantCountForFamily read registry', () => {
    expect(getDefaultVariantIdForFamily('table')).toBe('rect_wood');
    expect(getVariantCountForFamily('table')).toBe(2);
    expect(getVariantCountForFamily('city')).toBe(1);
  });

  it('table: concrete variants only; defaultVariantId points at rect_wood (no variants.default)', () => {
    const table = AUTHORED_PLACED_OBJECT_DEFINITIONS.table;
    expect(table.defaultVariantId).toBe('rect_wood');
    expect('default' in table.variants).toBe(false);
    const rect = table.variants.rect_wood;
    expect(rect.label).toBe('Table');
    expect(rect.presentation?.material).toBe('wood');
    expect(rect.presentation?.shape).toBe('rectangle');
    expect(table.variants.circle_wood).toBeDefined();
    expect(table.variants.circle_wood.presentation?.shape).toBe('circle');
    expect(table.variants.circle_wood.presentation?.material).toBe('wood');
    expect(getDefaultVariantIdForFamily('table')).toBe('rect_wood');
    expect(normalizeVariantIdForFamily('table', null)).toBe('rect_wood');
    expect(normalizeVariantIdForFamily('table', 'default')).toBe('rect_wood');
  });

  it('variant picker rows surface presentation for consumers', () => {
    const rows = getPlacedObjectVariantPickerRowsForFamily('table');
    const circle = rows.find((r) => r.variantId === 'circle_wood');
    expect(circle?.presentation?.shape).toBe('circle');
    expect(rows.find((r) => r.variantId === 'rect_wood')?.presentation?.shape).toBe('rectangle');
  });
});
