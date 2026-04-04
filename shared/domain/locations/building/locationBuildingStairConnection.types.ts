/**
 * Canonical **paired** stair linkage for a building (`scale === 'building'`).
 *
 * Phase 2 establishes **authored pairing and consistency** only: two stair endpoints on **different floor**
 * locations are linked by a single record. **Combat movement**, **pathfinding**, **floor-switch UX**, and
 * **runtime traversal** are **not** implemented here — intentional groundwork.
 */

/**
 * Identifies one stair **endpoint** on a floor map: the floor location, grid cell, and placed object id.
 * This is the stable handle used inside {@link LocationVerticalStairConnection}.
 */
export type LocationStairEndpointRef = {
  /** Campaign location id of the floor (`scale === 'floor'`) that owns the map. */
  floorLocationId: string;
  /** Author grid cell id (e.g. `"2,3"`). */
  cellId: string;
  /** {@link LocationMapCellObjectEntry.id} for the `stairs` object on that cell. */
  objectId: string;
};

/**
 * Exactly two endpoints, each on a **different** floor location under the same building.
 * This record is the **source of truth** for pairing; do not rely on duplicated `targetLocationId` alone.
 *
 * Full **reciprocal sync** with map cell objects is maintained by the editor (connection id on
 * `stairEndpoint`); **traversal** behavior is still **TODO**.
 */
export type LocationVerticalStairConnection = {
  id: string;
  kind: 'stairs';
  /** Building location id (`scale === 'building'`) this connection belongs to. */
  buildingLocationId: string;
  endpointA: LocationStairEndpointRef;
  endpointB: LocationStairEndpointRef;
};
