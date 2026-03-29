export type LocationTransitionKind = 'enter' | 'exit' | 'door' | 'stairs' | 'portal' | 'zoom';

export type LocationTransitionFrom = {
  mapId: string;
  cellId: string;
};

export type LocationTransitionTo = {
  locationId: string;
  mapId?: string;
  targetCellId?: string;
  spawnCellId?: string;
};

export type LocationTransitionTraversal = {
  bidirectional?: boolean;
  locked?: boolean;
  dc?: number;
  keyItemId?: string;
};

export type LocationTransition = {
  id: string;
  campaignId: string;
  from: LocationTransitionFrom;
  to: LocationTransitionTo;
  kind: LocationTransitionKind;
  label?: string;
  traversal?: LocationTransitionTraversal;
};
