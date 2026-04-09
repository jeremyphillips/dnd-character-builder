import type { LocationMapUiResolvedStyles } from '@/features/content/locations/domain/presentation/map/locationMapUiStyles';
import type { LocationMapSelection } from '@/features/content/locations/components/workspace/rightRail/types';

type PathSvgItem = {
  pathId: string;
  kind: string;
  d: string;
};

type LocationMapPathSvgPathsProps = {
  pathSvgData: PathSvgItem[];
  mapUi: LocationMapUiResolvedStyles;
  /** Host location scale (e.g. world vs city) — drives stroke width; defaults to fallback widths when omitted. */
  hostScale?: string;
  mapSelection: LocationMapSelection;
  selectHoverTarget: LocationMapSelection;
};

export function LocationMapPathSvgPaths({
  pathSvgData,
  mapUi,
  hostScale = '',
  mapSelection,
  selectHoverTarget,
}: LocationMapPathSvgPathsProps) {
  return (
    <>
      {pathSvgData.map((p) => (
        <path
          key={`path-${p.pathId}`}
          d={p.d}
          fill="none"
          pointerEvents="none"
          stroke={mapUi.path.strokeForKind(p.kind)}
          strokeWidth={
            p.pathId !== '__preview__' &&
            ((mapSelection.type === 'path' && mapSelection.pathId === p.pathId) ||
              (selectHoverTarget.type === 'path' && selectHoverTarget.pathId === p.pathId))
              ? mapUi.path.selectedStrokeWidthPxForHost(hostScale)
              : mapUi.path.defaultStrokeWidthPxForHost(hostScale)
          }
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </>
  );
}
