/**
 * Resolves semantic map glyph tokens to MUI `SvgIcon` components.
 * Metadata stays free of React/MUI — only this module maps ids → components.
 *
 * See `locationMapIconNames.ts` for object vs scale ownership; compose via
 * {@link getLocationMapGlyphIconByName} when the caller may pass either namespace.
 */
import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ApartmentIcon from '@mui/icons-material/Apartment';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import ForestIcon from '@mui/icons-material/Forest';
import HomeIcon from '@mui/icons-material/Home';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import PublicIcon from '@mui/icons-material/Public';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import StairsIcon from '@mui/icons-material/Stairs';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import TerrainIcon from '@mui/icons-material/Terrain';

import type {
  LocationMapGlyphIconName,
  LocationMapObjectIconName,
  LocationMapScaleIconName,
} from '@/features/content/locations/domain/mapContent';

export type LocationMapDisplayIconComponent = ComponentType<SvgIconProps>;

const FALLBACK_ICON = RadioButtonUncheckedIcon;

/** MUI component per **scale** affordance icon id. */
export const LOCATION_MAP_SCALE_ICON_COMPONENT_BY_NAME: Record<
  LocationMapScaleIconName,
  LocationMapDisplayIconComponent
> = {
  map_world: PublicIcon,
  map_region: MapIcon,
  map_subregion: LayersIcon,
  map_city: MapsHomeWorkIcon,
  map_district: TerrainIcon,
  map_site: AccountBalanceIcon,
  map_building: HomeIcon,
  map_floor: ApartmentIcon,
  map_room: MeetingRoomIcon,
};

/** MUI component per **object** icon id (persisted kinds + place-tool props). */
export const LOCATION_MAP_OBJECT_ICON_COMPONENT_BY_NAME: Record<
  LocationMapObjectIconName,
  LocationMapDisplayIconComponent
> = {
  marker: RadioButtonUncheckedIcon,
  table: TableRestaurantIcon,
  treasure: Inventory2Icon,
  door: DoorFrontIcon,
  stairs: StairsIcon,
  tree: ForestIcon,
};

/** Combined lookup table (object + scale keys are disjoint). */
export const LOCATION_MAP_GLYPH_ICON_COMPONENT_BY_NAME: Record<
  LocationMapGlyphIconName,
  LocationMapDisplayIconComponent
> = {
  ...LOCATION_MAP_OBJECT_ICON_COMPONENT_BY_NAME,
  ...LOCATION_MAP_SCALE_ICON_COMPONENT_BY_NAME,
};

export function getLocationMapScaleIconByName(
  name: LocationMapScaleIconName,
): LocationMapDisplayIconComponent {
  return LOCATION_MAP_SCALE_ICON_COMPONENT_BY_NAME[name] ?? FALLBACK_ICON;
}

export function getLocationMapObjectIconByName(
  name: LocationMapObjectIconName,
): LocationMapDisplayIconComponent {
  return LOCATION_MAP_OBJECT_ICON_COMPONENT_BY_NAME[name] ?? FALLBACK_ICON;
}

export function getLocationMapGlyphIconByName(
  name: LocationMapGlyphIconName,
): LocationMapDisplayIconComponent {
  return LOCATION_MAP_GLYPH_ICON_COMPONENT_BY_NAME[name] ?? FALLBACK_ICON;
}
