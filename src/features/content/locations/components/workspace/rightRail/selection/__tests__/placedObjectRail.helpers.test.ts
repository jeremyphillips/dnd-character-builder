import { describe, expect, it } from 'vitest';

import type { Location } from '@/features/content/locations/domain/model/location';

import { shouldShowLinkedIdentityForPlacedObject } from '../placedObjectRail.helpers';

function loc(partial: Pick<Location, 'id' | 'name' | 'scale'>): Location {
  return partial as Location;
}

describe('shouldShowLinkedIdentityForPlacedObject', () => {
  it('returns true when family has linkedScale and linked location scale matches', () => {
    expect(
      shouldShowLinkedIdentityForPlacedObject('city', 'loc-1', loc({ id: 'loc-1', name: 'Rivendell', scale: 'city' })),
    ).toBe(true);
  });

  it('returns false when linked location scale does not match family linkedScale', () => {
    expect(
      shouldShowLinkedIdentityForPlacedObject('city', 'loc-1', loc({ id: 'loc-1', name: 'X', scale: 'site' })),
    ).toBe(false);
  });

  it('returns false when family has no linkedScale (e.g. table)', () => {
    expect(
      shouldShowLinkedIdentityForPlacedObject('table', 'loc-1', loc({ id: 'loc-1', name: 'Y', scale: 'floor' })),
    ).toBe(false);
  });

  it('returns false when no linked location id', () => {
    expect(shouldShowLinkedIdentityForPlacedObject('city', undefined, undefined)).toBe(false);
  });
});
