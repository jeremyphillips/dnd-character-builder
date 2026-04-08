import Typography from '@mui/material/Typography';

import type { LocationMapPathAuthoringEntry } from '@/shared/domain/locations';

import { RailNameDescriptionFields } from '../fields/railNameDescriptionFields';
import { SelectionRailTemplate } from '../templates/SelectionRailTemplate';
import { formatCellPlacementLine, pathKindDisplayTitle } from '../selectionRail.helpers';

export type LocationMapPathInspectorProps = {
  pathId: string;
  pathEntries: readonly LocationMapPathAuthoringEntry[];
  /** When set, “Remove from map” removes the whole chain (same as map Delete for paths). */
  onRemovePathFromMap?: (pathId: string) => void;
  /** Persisted path metadata (name / description) — same draft as map save. */
  onPatchPathEntry?: (
    pathId: string,
    patch: Partial<Pick<LocationMapPathAuthoringEntry, 'name' | 'description'>>,
  ) => void;
};

export function LocationMapPathInspector({
  pathId,
  pathEntries,
  onRemovePathFromMap,
  onPatchPathEntry,
}: LocationMapPathInspectorProps) {
  const entry = pathEntries.find((p) => p.id === pathId);
  if (!entry) {
    return (
      <Typography variant="body2" color="text.secondary">
        This path is no longer on the map.
      </Typography>
    );
  }

  const placementCell = entry.cellIds[0] ?? '';
  const placementLine = formatCellPlacementLine(placementCell);

  return (
    <SelectionRailTemplate
      categoryLabel="Path"
      title={pathKindDisplayTitle(entry.kind)}
      placementLine={placementLine}
      onRemoveFromMap={onRemovePathFromMap ? () => onRemovePathFromMap(pathId) : undefined}
    >
      <RailNameDescriptionFields
        name={entry.name ?? ''}
        description={entry.description ?? ''}
        onNameChange={(v) => onPatchPathEntry?.(pathId, { name: v })}
        onDescriptionChange={(v) => onPatchPathEntry?.(pathId, { description: v })}
      />
    </SelectionRailTemplate>
  );
}
