import { describe, expect, it } from 'vitest';

import {
  resolveAuthoredDoorState,
  sanitizeAuthoredDoorState,
} from '../locationMapDoorAuthoring.helpers';

describe('locationMapDoorAuthoring.helpers', () => {
  it('resolveAuthoredDoorState defaults missing to closed and unlocked', () => {
    expect(resolveAuthoredDoorState(undefined)).toEqual({ openState: 'closed', lockState: 'unlocked' });
    expect(resolveAuthoredDoorState({})).toEqual({ openState: 'closed', lockState: 'unlocked' });
  });

  it('sanitizeAuthoredDoorState coerces open + barred to closed + barred', () => {
    expect(sanitizeAuthoredDoorState({ openState: 'open', lockState: 'barred' })).toEqual({
      openState: 'closed',
      lockState: 'barred',
    });
  });

  it('sanitizeAuthoredDoorState leaves consistent open + unlocked', () => {
    expect(sanitizeAuthoredDoorState({ openState: 'open', lockState: 'unlocked' })).toEqual({
      openState: 'open',
      lockState: 'unlocked',
    });
  });
});
