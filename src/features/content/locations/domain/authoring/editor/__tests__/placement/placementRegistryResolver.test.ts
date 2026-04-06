// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { resolvePlacementCellClick } from '../../placement/placementRegistryResolver';

describe('placementRegistryResolver', () => {
  it('resolves linked-content city on world to link pending', () => {
    const r = resolvePlacementCellClick(
      { category: 'linked-content', kind: 'city', variantId: 'default' },
      'c-0-0',
      'world',
    );
    expect(r.kind).toBe('link');
    if (r.kind === 'link') {
      expect(r.pending.type).toBe('linked-location');
      expect(r.pending.targetCellId).toBe('c-0-0');
      expect(r.pending.linkedScale).toBe('city');
    }
  });

  it('resolves floor table to append-object with payload', () => {
    const r = resolvePlacementCellClick(
      { category: 'map-object', kind: 'table', variantId: 'default' },
      'c-1-1',
      'floor',
    );
    expect(r.kind).toBe('append-object');
    if (r.kind === 'append-object') {
      expect(r.cellId).toBe('c-1-1');
      expect(r.objectDraft.kind).toBe('table');
      expect(r.objectDraft.authoredPlaceKindId).toBe('table');
    }
  });

  it('seeds stairEndpoint for stairs on floor', () => {
    const r = resolvePlacementCellClick(
      { category: 'map-object', kind: 'stairs', variantId: 'default' },
      'c-2-2',
      'floor',
    );
    expect(r.kind).toBe('append-object');
    if (r.kind === 'append-object') {
      expect(r.objectDraft.kind).toBe('stairs');
      expect(r.objectDraft.stairEndpoint?.direction).toBe('both');
    }
  });
});
