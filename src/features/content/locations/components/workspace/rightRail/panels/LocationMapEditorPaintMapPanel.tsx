import Typography from '@mui/material/Typography';

import type { LocationMapPaintState } from '@/features/content/locations/domain/authoring/editor';

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

  return (
    <Typography variant="body2" color="text.secondary">
      Region paint: choose a preset in the tray, then paint cells. Name, color, and description are in Selection.
    </Typography>
  );
}
