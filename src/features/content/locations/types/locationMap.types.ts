export type LocationMapKind = 'world-grid' | 'area-grid' | 'encounter-grid';

export type LocationMapGrid = {
  width: number;
  height: number;
  cellUnit: string | number;
};

export type LocationMapCell = {
  cellId: string;
  x: number;
  y: number;
  terrain?: string;
  label?: string;
};

export type LocationMap = {
  id: string;
  campaignId: string;
  locationId: string;
  name: string;
  kind: LocationMapKind;
  grid: LocationMapGrid;
  isDefault?: boolean;
  cells?: LocationMapCell[];
};
