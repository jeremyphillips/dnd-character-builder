import type { MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { getMapRegionColor, getMapSwatchColor } from '@/app/theme/mapColors';
import { LOCATION_MAP_REGION_COLOR_KEYS } from '@/features/content/locations/domain/mapContent/locationMapRegionColors.types';
import type { LocationMapRegionColorKey } from '@/features/content/locations/domain/mapContent/locationMapRegionColors.types';
import type {
  LocationMapPaintState,
  MapPaintPaletteItem,
} from '@/features/content/locations/domain/mapEditor/locationMapEditor.types';
import {
  ensureRegionDraftTarget,
} from '@/features/content/locations/domain/mapEditor/locationMapPaintSelection.helpers';
import type { LocationCellFillKindId } from '@/features/content/locations/domain/mapContent/locationCellFill.types';
import {
  LOCATION_EDITOR_PAINT_TRAY_WIDTH_PX,
  LOCATION_EDITOR_TOOLBAR_WIDTH_PX,
} from '@/features/content/locations/components/workspace/locationEditor.constants';

type LocationMapEditorPaintTrayProps = {
  items: MapPaintPaletteItem[];
  activePaint: LocationMapPaintState;
  onPaintChange: (next: LocationMapPaintState) => void;
};

export function LocationMapEditorPaintTray({
  items,
  activePaint,
  onPaintChange,
}: LocationMapEditorPaintTrayProps) {
  if (items.length === 0) return null;

  const domain = activePaint.domain;

  const handleDomainChange = (_: MouseEvent<HTMLElement>, value: 'surface' | 'region' | null) => {
    if (value == null) return;
    if (value === 'surface') {
      onPaintChange({ ...activePaint, domain: 'surface' });
      return;
    }
    onPaintChange(ensureRegionDraftTarget(activePaint));
  };

  const handleSelectSurface = (kind: LocationCellFillKindId) => {
    onPaintChange({
      ...activePaint,
      domain: 'surface',
      surfaceFillKind: kind,
    });
  };

  const handleSelectRegionColor = (key: LocationMapRegionColorKey) => {
    onPaintChange({
      ...ensureRegionDraftTarget({ ...activePaint, domain: 'region' }),
      activeRegionColorKey: key,
    });
  };

  const regionColorKey = activePaint.activeRegionColorKey ?? LOCATION_MAP_REGION_COLOR_KEYS[0];
  const regionSwatchColor = getMapRegionColor(regionColorKey);

  return (
    <Box
      sx={{
        // TODO: move to absolute position after tackling other trays
        // position: 'absolute',
        // top: 0,
        // bottom: 0,
        // left: LOCATION_EDITOR_TOOLBAR_WIDTH_PX,
        // zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        py: 0.5,
        pr: 0.5,
        pl: 0.25,
        width: LOCATION_EDITOR_PAINT_TRAY_WIDTH_PX,
        minWidth: LOCATION_EDITOR_PAINT_TRAY_WIDTH_PX,
        maxWidth: LOCATION_EDITOR_PAINT_TRAY_WIDTH_PX,
        boxSizing: 'border-box',
        borderRadius: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        alignItems: 'stretch',
      }}
    >
      <ToggleButtonGroup
        exclusive
        value={domain}
        onChange={handleDomainChange}
        orientation="vertical"
        size="small"
        sx={{
          alignSelf: 'stretch',
          borderRadius: 0,
          '& .MuiToggleButton-root': { borderRadius: 0 },
        }}
      >
        <ToggleButton value="surface" aria-label="Surface paint">
          Surface
        </ToggleButton>
        <ToggleButton value="region" aria-label="Region paint">
          Region
        </ToggleButton>
      </ToggleButtonGroup>

      {domain === 'surface' ? (
        <Stack direction="column" spacing={0.75} alignItems="center">
          {items.map((item) => {
            const color = getMapSwatchColor(item.swatchColorKey);
            const selected = activePaint.surfaceFillKind === item.fillKind;
            return (
              <Tooltip key={item.fillKind} title={item.label} placement="right">
                <Box
                  component="button"
                  type="button"
                  onClick={() => handleSelectSurface(item.fillKind)}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 0,
                    border: 2,
                    borderColor: selected ? 'primary.main' : 'divider',
                    bgcolor: color,
                    cursor: 'pointer',
                    p: 0,
                    flexShrink: 0,
                    boxShadow: selected ? 2 : 0,
                  }}
                  aria-label={item.label}
                  aria-pressed={selected}
                />
              </Tooltip>
            );
          })}
        </Stack>
      ) : (
        <Stack spacing={1} sx={{ px: 0.25 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Active region
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 0,
                border: 2,
                borderColor: 'primary.main',
                bgcolor: regionSwatchColor,
                flexShrink: 0,
              }}
              aria-hidden
            />
            <Typography variant="caption" noWrap sx={{ minWidth: 0 }}>
              {activePaint.regionLabel}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Preset colors
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 28px)',
              gap: 0.5,
              justifyContent: 'center',
            }}
          >
            {LOCATION_MAP_REGION_COLOR_KEYS.map((key) => {
              const c = getMapRegionColor(key);
              const selected = regionColorKey === key;
              return (
                <Tooltip key={key} title={key} placement="right">
                  <Box
                    component="button"
                    type="button"
                    onClick={() => handleSelectRegionColor(key)}
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 0,
                      border: 2,
                      borderColor: selected ? 'primary.main' : 'divider',
                      bgcolor: c,
                      cursor: 'pointer',
                      p: 0,
                      boxShadow: selected ? 2 : 0,
                    }}
                    aria-label={key}
                    aria-pressed={selected}
                  />
                </Tooltip>
              );
            })}
          </Box>
        </Stack>
      )}
    </Box>
  );
}
