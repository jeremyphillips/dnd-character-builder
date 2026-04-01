import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { getMapRegionColor } from '@/app/theme/mapColors';
import { LOCATION_MAP_REGION_COLOR_KEYS } from '@/features/content/locations/domain/mapContent/locationMapRegionColors.types';
import type { LocationMapPaintState } from '@/features/content/locations/domain/mapEditor/locationMapEditor.types';

type LocationMapEditorPaintMapPanelProps = {
  paint: LocationMapPaintState;
};

export function LocationMapEditorPaintMapPanel({ paint }: LocationMapEditorPaintMapPanelProps) {
  if (paint.domain === 'surface') {
    return (
      <Typography variant="body2" color="text.secondary">
        Paint domain: Surface. Use the tray to pick terrain, then drag across cells to paint fills.
      </Typography>
    );
  }

  const colorKey = paint.activeRegionColorKey ?? LOCATION_MAP_REGION_COLOR_KEYS[0];
  const swatch = getMapRegionColor(colorKey);

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2" fontWeight={600}>
        Region paint
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Paint domain: Region
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 0.5,
            border: 1,
            borderColor: 'divider',
            bgcolor: swatch,
            flexShrink: 0,
          }}
          aria-hidden
        />
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {paint.regionLabel}
          </Typography>
          {paint.activeRegionDraftId ? (
            <Typography variant="caption" color="text.secondary" noWrap title={paint.activeRegionDraftId}>
              Draft: {paint.activeRegionDraftId.slice(0, 8)}…
            </Typography>
          ) : null}
        </Stack>
      </Box>
      <Typography variant="body2" color="text.secondary">
        Region metadata and assigning cells to regions will come in a later pass. For now, choose a preset color and
        draft target in the tray.
      </Typography>
    </Stack>
  );
}
