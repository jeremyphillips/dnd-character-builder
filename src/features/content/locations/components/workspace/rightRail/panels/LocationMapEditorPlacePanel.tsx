import { createElement, useState, type MouseEvent } from 'react';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { getLocationMapGlyphIconByName } from '@/features/content/locations/domain';
import { getPlacedObjectVariantPickerRowsForFamily } from '@/features/content/locations/domain/model/placedObjects/locationPlacedObject.types';
import type {
  LocationMapActivePlaceSelection,
  MapPlacePaletteItem,
} from '@/features/content/locations/domain/authoring/editor';

function isFamilyTileSelected(item: MapPlacePaletteItem, active: LocationMapActivePlaceSelection): boolean {
  if (!active) return false;
  if (item.category === 'linked-content' && active.category !== 'linked-content') return false;
  if (item.category === 'map-object' && active.category !== 'map-object') return false;
  return active.kind === item.kind;
}

function itemKey(item: MapPlacePaletteItem): string {
  return item.category === 'linked-content' ? `linked:${item.kind}` : `object:${item.kind}`;
}

function paletteTooltipTitle(item: MapPlacePaletteItem): string {
  const base = item.description ? `${item.label} — ${item.description}` : item.label;
  if (item.category === 'map-object' && item.variantCount > 1) {
    return `${base}\n\nClick the tile to place the default variant. Use the menu to choose another variant.`;
  }
  return base;
}

type LocationMapEditorPlacePanelProps = {
  items: MapPlacePaletteItem[];
  activePlace: LocationMapActivePlaceSelection;
  onSelectPlace: (selection: LocationMapActivePlaceSelection) => void;
};

export function LocationMapEditorPlacePanel({
  items,
  activePlace,
  onSelectPlace,
}: LocationMapEditorPlacePanelProps) {
  const linkedItems = items.filter(
    (i): i is Extract<MapPlacePaletteItem, { category: 'linked-content' }> => i.category === 'linked-content',
  );
  const objectItems = items.filter(
    (i): i is Extract<MapPlacePaletteItem, { category: 'map-object' }> => i.category === 'map-object',
  );

  const [variantPicker, setVariantPicker] = useState<{
    anchor: HTMLElement;
    kind: Extract<MapPlacePaletteItem, { category: 'map-object' }>;
  } | null>(null);

  const closePicker = () => setVariantPicker(null);

  const renderCard = (item: MapPlacePaletteItem) => {
    const key = itemKey(item);
    const selected = isFamilyTileSelected(item, activePlace);
    const Icon = item.iconName
      ? getLocationMapGlyphIconByName(item.iconName)
      : getLocationMapGlyphIconByName('marker');
    const showMapVariantPicker = item.category === 'map-object' && item.variantCount > 1;
    const activeVariantLabel =
      selected && activePlace && activePlace.kind === item.kind
        ? getPlacedObjectVariantPickerRowsForFamily(item.kind).find(
            (r) => r.variantId === activePlace.variantId,
          )?.label
        : undefined;

    const onPrimaryClick = () => {
      if (item.category === 'linked-content') {
        onSelectPlace({ category: 'linked-content', kind: item.kind, variantId: item.defaultVariantId });
      } else {
        onSelectPlace({ category: 'map-object', kind: item.kind, variantId: item.defaultVariantId });
      }
    };

    const onOpenVariantPicker = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (item.category !== 'map-object') return;
      setVariantPicker({ anchor: e.currentTarget, kind: item });
    };

    return (
      <Card
        key={key}
        variant="outlined"
        sx={{
          borderColor: selected ? 'primary.main' : 'divider',
          borderWidth: selected ? 2 : 1,
          position: 'relative',
        }}
      >
        <Tooltip title={paletteTooltipTitle(item)} slotProps={{ tooltip: { sx: { whiteSpace: 'pre-line' } } }}>
          <Box sx={{ position: 'relative' }}>
            <Badge
              badgeContent={showMapVariantPicker ? item.variantCount : 0}
              color="default"
              invisible={!showMapVariantPicker}
            >
              <CardActionArea onClick={onPrimaryClick} sx={{ p: 1 }}>
                <Stack alignItems="center" spacing={0.5}>
                  {createElement(Icon, {
                    fontSize: 'small',
                    color: 'action',
                    'aria-hidden': true,
                  })}
                  <Typography variant="caption" textAlign="center" fontWeight={selected ? 600 : 400}>
                    {item.label}
                  </Typography>
                  {selected && activeVariantLabel && activePlace?.variantId !== item.defaultVariantId ? (
                    <Typography variant="caption" textAlign="center" color="primary" fontWeight={600}>
                      {activeVariantLabel}
                    </Typography>
                  ) : null}
                </Stack>
              </CardActionArea>
            </Badge>
            {showMapVariantPicker ? (
              <IconButton
                type="button"
                size="small"
                onClick={onOpenVariantPicker}
                aria-label={`More variants for ${item.label}`}
                sx={{
                  position: 'absolute',
                  right: 4,
                  bottom: 4,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <UnfoldMoreIcon fontSize="small" />
              </IconButton>
            ) : null}
          </Box>
        </Tooltip>
      </Card>
    );
  };

  const grid = (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: 1,
      }}
    >
      {items.map((item) => renderCard(item))}
    </Box>
  );

  if (items.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No placeable content for this map scale.
      </Typography>
    );
  }

  const hasGroups = linkedItems.length > 0 && objectItems.length > 0;

  const picker =
    variantPicker != null ? (
      <Popover
        open
        anchorEl={variantPicker.anchor}
        onClose={closePicker}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        slotProps={{ paper: { sx: { minWidth: 220, maxWidth: 320 } } }}
      >
        <List dense disablePadding>
          {getPlacedObjectVariantPickerRowsForFamily(variantPicker.kind.kind).map((row) => {
            const RowIcon = getLocationMapGlyphIconByName(row.iconName);
            return (
              <Tooltip key={row.variantId} title={row.description ?? row.label} placement="right">
                <ListItemButton
                  onClick={() => {
                    onSelectPlace({
                      category: 'map-object',
                      kind: variantPicker.kind.kind,
                      variantId: row.variantId,
                    });
                    closePicker();
                  }}
                  selected={
                    activePlace?.category === 'map-object' &&
                    activePlace.kind === variantPicker.kind.kind &&
                    activePlace.variantId === row.variantId
                  }
                >
                  <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                    {createElement(RowIcon, {
                      fontSize: 'small',
                      color: 'action',
                      'aria-hidden': true,
                    })}
                  </Box>
                  <ListItemText primary={row.label} secondary={row.description} />
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Popover>
    ) : null;

  if (!hasGroups) {
    return (
      <Stack spacing={1}>
        <Typography variant="subtitle2" fontWeight={600}>
          Place on map
        </Typography>
        {grid}
        {picker}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600}>
        Place on map
      </Typography>
      {linkedItems.length > 0 ? (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Linked content
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 1,
            }}
          >
            {linkedItems.map((item) => renderCard(item))}
          </Box>
        </Box>
      ) : null}
      {objectItems.length > 0 ? (
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            Map objects
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 1,
            }}
          >
            {objectItems.map((item) => renderCard(item))}
          </Box>
        </Box>
      ) : null}
      {picker}
    </Stack>
  );
}
