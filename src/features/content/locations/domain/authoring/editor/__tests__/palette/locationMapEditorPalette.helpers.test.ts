// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  getPaintPaletteItemsForScale,
  getPlacePaletteItemsForScale,
} from '../../palette';

describe('locationMapEditorPalette.helpers', () => {
  it('getPaintPaletteItemsForScale maps policy + cell-fill meta', () => {
    const items = getPaintPaletteItemsForScale('world');
    expect(items.map((i) => i.fillKind)).toEqual([
      'mountains',
      'plains',
      'forest_light',
      'forest_heavy',
      'swamp',
      'desert',
      'water',
    ]);
    expect(items[0].label).toBe('Mountains');
    expect(items[0].swatchColorKey).toBe('cellFillMountains');
  });

  it('getPlacePaletteItemsForScale maps policy + linked-content vs map-object', () => {
    const items = getPlacePaletteItemsForScale('world');
    expect(items.map((i) => i.kind)).toEqual(['city']);
    expect(items[0].label).toBe('City');
    expect(items[0].category).toBe('linked-content');
    expect(items[0].familyId).toBe('city');
    expect(items[0].variantId).toBe('default');
    expect(items[0].defaultVariantId).toBe('default');
    expect(items[0].variantCount).toBe(1);
    expect(items[0].paletteCategory).toBe('structure');
    if (items[0].category === 'linked-content') {
      expect(items[0].linkedScale).toBe('city');
    }
  });

  it('floor map-object families expose variantCount from registry (table has multiple variants)', () => {
    const floor = getPlacePaletteItemsForScale('floor');
    const table = floor.find((i) => i.kind === 'table');
    expect(table?.category).toBe('map-object');
    if (table?.category === 'map-object') {
      expect(table.variantCount).toBe(2);
      expect(table.defaultVariantId).toBe('rect_wood');
    }
  });
});
