import type { LocationMapPathAuthoringEntry } from './locationMap.types';

/**
 * Remove one adjacent step from a path chain, splitting into up to two chains.
 * Used when erasing a single segment along an authored path.
 */
export function removePathChainSegment(
  pathEntries: readonly LocationMapPathAuthoringEntry[],
  pathId: string,
  cellA: string,
  cellB: string,
  newId: () => string,
): LocationMapPathAuthoringEntry[] {
  const ta = cellA.trim();
  const tb = cellB.trim();
  const idx = pathEntries.findIndex((e) => e.id === pathId);
  if (idx < 0) return [...pathEntries];
  const entry = pathEntries[idx];
  const chain = entry.cellIds;
  let split = -1;
  for (let i = 0; i < chain.length - 1; i++) {
    const x = chain[i].trim();
    const y = chain[i + 1].trim();
    if ((x === ta && y === tb) || (x === tb && y === ta)) {
      split = i;
      break;
    }
  }
  if (split < 0) return [...pathEntries];
  const left = chain.slice(0, split + 1);
  const right = chain.slice(split + 1);
  const kind = entry.kind;
  const toAdd: LocationMapPathAuthoringEntry[] = [];
  if (left.length >= 2) {
    toAdd.push({ id: newId(), kind, cellIds: left });
  }
  if (right.length >= 2) {
    toAdd.push({ id: newId(), kind, cellIds: right });
  }
  return [...pathEntries.slice(0, idx), ...toAdd, ...pathEntries.slice(idx + 1)];
}
