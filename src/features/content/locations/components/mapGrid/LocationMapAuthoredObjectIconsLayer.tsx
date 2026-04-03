import { createElement } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { getLocationMapObjectKindIcon } from '@/features/content/locations/domain';
import type { LocationMapAuthoredObjectRenderItem } from '@/shared/domain/locations/map/locationMapAuthoredObjectRender.types';
import { squareCellCenterPx } from '@/shared/domain/grid/squareGridOverlayGeometry';

function groupByAuthorCellId(
  items: readonly LocationMapAuthoredObjectRenderItem[],
): Map<string, LocationMapAuthoredObjectRenderItem[]> {
  const m = new Map<string, LocationMapAuthoredObjectRenderItem[]>();
  for (const it of items) {
    const list = m.get(it.authorCellId) ?? [];
    list.push(it);
    m.set(it.authorCellId, list);
  }
  return m;
}

export type LocationMapAuthoredObjectIconsLayerProps = {
  items: readonly LocationMapAuthoredObjectRenderItem[];
  cellPx: number;
  gapPx: number;
};

const ICON_FONT_PX = 22;

/**
 * Cell-anchored authored object icons in grid-local pixels. Uses {@link squareCellCenterPx} with **author** cell ids (`x,y`).
 * Sits above path/edge SVG within the authored base-map stack; below tactical cell chrome in combat.
 */
export function LocationMapAuthoredObjectIconsLayer({
  items,
  cellPx,
  gapPx,
}: LocationMapAuthoredObjectIconsLayerProps) {
  if (items.length === 0) return null;
  const groups = groupByAuthorCellId(items);
  const iconSx = {
    fontSize: ICON_FONT_PX,
    width: ICON_FONT_PX,
    height: ICON_FONT_PX,
    display: 'block' as const,
  };
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
      aria-hidden
    >
      {Array.from(groups.entries()).map(([authorCellId, cellItems]) => {
        const p = squareCellCenterPx(authorCellId, cellPx, gapPx);
        if (!p) return null;
        return (
          <Box
            key={authorCellId}
            sx={{
              position: 'absolute',
              left: p.cx,
              top: p.cy,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          >
            <Stack
              direction="row"
              flexWrap="wrap"
              justifyContent="center"
              alignItems="center"
              gap={0.25}
              sx={{ lineHeight: 0, maxWidth: cellPx }}
            >
              {cellItems.map((o) => (
                <Box
                  key={o.id}
                  component="span"
                  data-map-object-id={o.id}
                  data-map-object-cell-id={authorCellId}
                  sx={{ display: 'inline-flex', lineHeight: 0 }}
                >
                  {createElement(getLocationMapObjectKindIcon(o.kind), {
                    sx: iconSx,
                    color: 'action',
                    'aria-hidden': true,
                  })}
                </Box>
              ))}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}
