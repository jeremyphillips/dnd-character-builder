import { createElement } from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { getLocationMapGlyphIconByName } from '@/features/content/locations/domain';
import type {
  LocationMapActivePlaceSelection,
  MapPlacePaletteItem,
} from '@/features/content/locations/domain/authoring/editor';
import { DEFAULT_AUTHORED_PLACE_VARIANT_ID } from '@/features/content/locations/domain/authoring/editor';

type LocationMapEditorPlaceTrayProps = {
  items: MapPlacePaletteItem[];
  activePlace: LocationMapActivePlaceSelection;
  onSelectPlace: (selection: LocationMapActivePlaceSelection) => void;
};

function placeSelectionKey(sel: LocationMapActivePlaceSelection): string | null {
  if (!sel) return null;
  const v = sel.variantId ?? DEFAULT_AUTHORED_PLACE_VARIANT_ID;
  if (sel.category === 'linked-content') return `linked:${sel.kind}:${v}`;
  return `object:${sel.kind}:${v}`;
}

function itemKey(item: MapPlacePaletteItem): string {
  if (item.category === 'linked-content') return `linked:${item.kind}:${item.variantId}`;
  return `object:${item.kind}:${item.variantId}`;
}

/**
 * Left toolbar tray for Place mode — registry-driven items only; sets `activePlace` (no placement mapping).
 */
export function LocationMapEditorPlaceTray({
  items,
  activePlace,
  onSelectPlace,
}: LocationMapEditorPlaceTrayProps) {
  if (items.length === 0) return null;

  const activeKey = placeSelectionKey(activePlace);

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        py: 0.5,
        pr: 0.5,
        pl: 0.25,
        alignItems: 'center',
        overflow: 'auto',
      }}
    >
      {items.map((item) => {
        const key = itemKey(item);
        const selected = activeKey === key;
        const Icon = item.iconName
          ? getLocationMapGlyphIconByName(item.iconName)
          : getLocationMapGlyphIconByName('marker');
        const onClick = () => {
          if (item.category === 'linked-content') {
            onSelectPlace({
              category: 'linked-content',
              kind: item.kind,
              variantId: item.variantId,
            });
          } else {
            onSelectPlace({
              category: 'map-object',
              kind: item.kind,
              variantId: item.variantId,
            });
          }
        };
        return (
          <Tooltip key={key} title={item.label} placement="right">
            <Box
              component="button"
              type="button"
              onClick={onClick}
              sx={{
                width: 36,
                minHeight: 36,
                px: 0.25,
                py: 0.25,
                borderRadius: 0.5,
                border: 2,
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: 'action.hover',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.25,
                boxShadow: selected ? 2 : 0,
              }}
              aria-label={item.label}
              aria-pressed={selected}
            >
              {createElement(Icon, {
                fontSize: 'small',
                color: 'action',
                'aria-hidden': true,
              })}
              <Typography
                variant="caption"
                fontWeight={selected ? 700 : 500}
                sx={{ lineHeight: 1, fontSize: 9, textAlign: 'center', px: 0.25 }}
              >
                {item.label.length <= 10 ? item.label : `${item.label.slice(0, 8)}…`}
              </Typography>
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
