import { describe, expect, it } from 'vitest';

import {
  normalizeEdgeAuthoringEntryForPersistence,
  normalizeEdgeAuthoringEntriesForPersistence,
} from '../locationMapEdgeAuthoring.normalize';

describe('normalizeEdgeAuthoringEntryForPersistence', () => {
  it('accepts legacy coarse-only row unchanged', () => {
    const row = { edgeId: 'between:0,0|1,0', kind: 'door' as const };
    expect(normalizeEdgeAuthoringEntryForPersistence(row)).toEqual(row);
  });

  it('accepts aligned authored bundle (kind + authoredPlaceKindId + variantId)', () => {
    const row = {
      edgeId: 'between:0,0|1,0',
      kind: 'door' as const,
      authoredPlaceKindId: 'door',
      variantId: 'single_wood',
      label: 'South Door',
    };
    expect(normalizeEdgeAuthoringEntryForPersistence(row)).toEqual({
      edgeId: 'between:0,0|1,0',
      kind: 'door',
      authoredPlaceKindId: 'door',
      variantId: 'single_wood',
      label: 'South Door',
    });
  });

  it('repairs kind when authored identity conflicts with coarse wall', () => {
    const row = {
      edgeId: 'between:0,0|1,0',
      kind: 'wall' as const,
      authoredPlaceKindId: 'door',
      variantId: 'single_wood',
    };
    expect(normalizeEdgeAuthoringEntryForPersistence(row)).toEqual({
      edgeId: 'between:0,0|1,0',
      kind: 'door',
      authoredPlaceKindId: 'door',
      variantId: 'single_wood',
    });
  });

  it('strips authored bundle when variant is invalid — falls back to coarse opening row', () => {
    const row = {
      edgeId: 'between:0,0|1,0',
      kind: 'door' as const,
      authoredPlaceKindId: 'door',
      variantId: 'not_real',
    };
    expect(normalizeEdgeAuthoringEntryForPersistence(row)).toEqual({
      edgeId: 'between:0,0|1,0',
      kind: 'door',
    });
  });

  it('backfills authoredPlaceKindId when invalid authored string was stripped but kind + variant are valid', () => {
    const row = {
      edgeId: 'between:0,0|1,0',
      kind: 'door' as const,
      authoredPlaceKindId: 'nope',
      variantId: 'single_wood',
    };
    expect(normalizeEdgeAuthoringEntryForPersistence(row)).toEqual({
      edgeId: 'between:0,0|1,0',
      kind: 'door',
      authoredPlaceKindId: 'door',
      variantId: 'single_wood',
    });
  });

  it('strips authored bundle when authored is set but variant is missing', () => {
    const row = {
      edgeId: 'between:0,0|1,0',
      kind: 'door' as const,
      authoredPlaceKindId: 'door',
    };
    expect(normalizeEdgeAuthoringEntryForPersistence(row)).toEqual({
      edgeId: 'between:0,0|1,0',
      kind: 'door',
    });
  });

  it('strips stray variant from wall-only rows', () => {
    const row = {
      edgeId: 'between:0,0|1,0',
      kind: 'wall' as const,
      variantId: 'single_wood',
    };
    expect(normalizeEdgeAuthoringEntryForPersistence(row)).toEqual({
      edgeId: 'between:0,0|1,0',
      kind: 'wall',
    });
  });

  it('normalizes arrays', () => {
    const rows = [{ edgeId: 'e1', kind: 'wall' as const }];
    expect(normalizeEdgeAuthoringEntriesForPersistence(rows)).toEqual(rows);
  });
});
