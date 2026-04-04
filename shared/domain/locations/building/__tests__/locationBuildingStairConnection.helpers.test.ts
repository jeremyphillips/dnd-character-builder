// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  connectionWouldDuplicateEndpoint,
  createVerticalStairConnection,
  findStairConnectionForEndpoint,
  getCounterpartStairEndpoint,
  removeStairConnectionsInvolvingEndpoint,
  resolveStairEndpointPairing,
  stairEndpointRefsEqual,
  validateStairEndpointsCanPair,
} from '../locationBuildingStairConnection.helpers';
import type { LocationStairEndpointRef } from '../locationBuildingStairConnection.types';

const buildingId = 'b1';
const fa = (o: string): LocationStairEndpointRef => ({
  floorLocationId: 'f1',
  cellId: '0,0',
  objectId: o,
});
const fb = (o: string): LocationStairEndpointRef => ({
  floorLocationId: 'f2',
  cellId: '1,1',
  objectId: o,
});

describe('locationBuildingStairConnection.helpers', () => {
  it('validateStairEndpointsCanPair rejects same floor', () => {
    const a = { floorLocationId: 'f1', cellId: '0,0', objectId: 'a' };
    const b = { floorLocationId: 'f1', cellId: '1,0', objectId: 'b' };
    expect(validateStairEndpointsCanPair(buildingId, a, b, new Set(['f1', 'f2'])).ok).toBe(false);
  });

  it('validateStairEndpointsCanPair accepts two floors under building', () => {
    const a = fa('s1');
    const b = fb('s2');
    expect(validateStairEndpointsCanPair(buildingId, a, b, new Set(['f1', 'f2'])).ok).toBe(true);
  });

  it('findStairConnectionForEndpoint and counterpart', () => {
    const a = fa('s1');
    const b = fb('s2');
    const c = createVerticalStairConnection(buildingId, 'conn-1', a, b);
    expect(findStairConnectionForEndpoint([c], a)?.id).toBe('conn-1');
    expect(stairEndpointRefsEqual(getCounterpartStairEndpoint(c, a)!, b)).toBe(true);
  });

  it('removeStairConnectionsInvolvingEndpoint', () => {
    const a = fa('s1');
    const b = fb('s2');
    const c = createVerticalStairConnection(buildingId, 'conn-1', a, b);
    expect(removeStairConnectionsInvolvingEndpoint([c], a)).toEqual([]);
  });

  it('connectionWouldDuplicateEndpoint', () => {
    const a = fa('s1');
    const b = fb('s2');
    const c = createVerticalStairConnection(buildingId, 'conn-1', a, b);
    expect(connectionWouldDuplicateEndpoint([c], fa('s1'), fb('y'))).toBe(true);
    expect(connectionWouldDuplicateEndpoint([c], fa('x'), fb('y'))).toBe(false);
  });

  it('resolveStairEndpointPairing returns linked when connection exists', () => {
    const a = fa('s1');
    const b = fb('s2');
    const c = createVerticalStairConnection(buildingId, 'conn-1', a, b);
    const r = resolveStairEndpointPairing([c], a, 'conn-1');
    expect(r.kind).toBe('linked');
    if (r.kind === 'linked') {
      expect(r.counterpart.floorLocationId).toBe('f2');
    }
  });

  it('resolveStairEndpointPairing returns orphaned when connectionId has no record', () => {
    const a = fa('s1');
    expect(resolveStairEndpointPairing([], a, 'gone').kind).toBe('orphaned');
  });
});
