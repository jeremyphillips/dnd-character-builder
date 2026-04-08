import { describe, expect, it } from 'vitest';

import { isLocationMapEdgeEntryDoorInstance } from '../locationMapEdgeDoorAuthoring';
import { resolveAuthoredEdgeInstance } from '../locationMapEdgeAuthoring.resolve';

describe('isLocationMapEdgeEntryDoorInstance', () => {
  it('matches resolveAuthoredEdgeInstance placedKind === door', () => {
    const door: Parameters<typeof isLocationMapEdgeEntryDoorInstance>[0] = {
      edgeId: 'between:0,0|1,0',
      kind: 'door',
      authoredPlaceKindId: 'door',
      variantId: 'single_wood',
    };
    expect(isLocationMapEdgeEntryDoorInstance(door)).toBe(true);
    expect(resolveAuthoredEdgeInstance(door).placedKind).toBe('door');
  });

  it('is false for window rows', () => {
    const w = {
      edgeId: 'between:0,0|1,0',
      kind: 'window',
      authoredPlaceKindId: 'window',
      variantId: 'glass',
    } as const;
    expect(isLocationMapEdgeEntryDoorInstance(w)).toBe(false);
    expect(resolveAuthoredEdgeInstance(w).placedKind).toBe('window');
  });

  it('is false for walls', () => {
    expect(
      isLocationMapEdgeEntryDoorInstance({ edgeId: 'between:0,0|1,0', kind: 'wall' }),
    ).toBe(false);
  });
});
