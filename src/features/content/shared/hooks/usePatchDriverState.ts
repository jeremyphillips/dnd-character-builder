import { useMemo } from 'react';
import { createPatchDriver, type PatchDriver } from '@/features/content/shared/editor/patchDriver';

export function usePatchDriverState(
  base: Record<string, unknown> | null,
  initialPatch: Record<string, unknown>,
  onPatchChange: (patch: Record<string, unknown>) => void,
  clearFeedback: () => void
): PatchDriver | null {
  return useMemo(() => {
    if (!base) return null;
    return createPatchDriver({
      base,
      initialPatch,
      onChange: (p) => {
        onPatchChange(p);
        clearFeedback();
      },
    });
  }, [base, initialPatch, onPatchChange, clearFeedback]);
}
