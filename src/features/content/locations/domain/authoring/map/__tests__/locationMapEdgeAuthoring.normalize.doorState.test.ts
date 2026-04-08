import { describe, expect, it } from 'vitest';

import { normalizeEdgeAuthoringEntryForPersistence } from '../locationMapEdgeAuthoring.normalize';

describe('normalizeEdgeAuthoringEntryForPersistence (doorState)', () => {
  it('strips doorState from wall rows', () => {
    const out = normalizeEdgeAuthoringEntryForPersistence({
      edgeId: 'between:0,0|1,0',
      kind: 'wall',
      doorState: { openState: 'open', lockState: 'unlocked' },
    });
    expect(out.doorState).toBeUndefined();
  });

  it('persists sanitized doorState for door rows', () => {
    const out = normalizeEdgeAuthoringEntryForPersistence({
      edgeId: 'between:0,0|1,0',
      kind: 'door',
      authoredPlaceKindId: 'door',
      variantId: 'single_wood',
      doorState: { openState: 'open', lockState: 'barred' },
    });
    expect(out.doorState).toEqual({ openState: 'closed', lockState: 'barred' });
  });
});
