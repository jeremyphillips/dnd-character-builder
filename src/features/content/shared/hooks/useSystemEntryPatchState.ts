import { useState, useEffect, useCallback } from 'react';
import {
  getContentPatch,
  getEntryPatch,
} from '@/features/content/shared/domain/contentPatchRepo';
import type { ContentTypeKey } from '@/features/content/shared/domain/patches/contentPatch.types';

export function useSystemEntryPatchState(
  campaignId: string | undefined,
  entryId: string | undefined,
  entry: unknown,
  isSystem: boolean,
  collectionKey: ContentTypeKey
) {
  const [initialPatch, setInitialPatch] = useState<Record<string, unknown>>({});
  const [, setPatchDraft] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (!campaignId || !entryId || !entry || !isSystem) return;
    let cancelled = false;
    getContentPatch(campaignId)
      .then((doc) => {
        if (cancelled) return;
        const existing = (getEntryPatch(doc, collectionKey, entryId) ?? {}) as Record<
          string,
          unknown
        >;
        setInitialPatch(existing);
        setPatchDraft(existing);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [campaignId, entryId, entry, isSystem, collectionKey]);

  const onPatchChange = useCallback((patch: Record<string, unknown>) => {
    setPatchDraft(patch);
  }, []);

  const hasExistingPatch = Object.keys(initialPatch).length > 0;

  return {
    initialPatch,
    setInitialPatch,
    hasExistingPatch,
    onPatchChange,
  };
}
