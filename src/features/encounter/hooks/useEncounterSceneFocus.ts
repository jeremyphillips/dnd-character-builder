import { useState, type Dispatch, type SetStateAction } from 'react'

import type { SceneFocus } from '../domain/sceneFocus.types'

/** Default: rendered tactical scene tracks authoritative {@link EncounterState.space}. */
export const DEFAULT_SCENE_FOCUS: SceneFocus = { kind: 'followEncounterSpace' }

/**
 * Viewer-local state: which scene this play surface is focused on (not shared across clients).
 *
 * @see SceneFocus — future pinned scenes and follow policy.
 */
export function useEncounterSceneFocus(): [SceneFocus, Dispatch<SetStateAction<SceneFocus>>] {
  return useState<SceneFocus>(DEFAULT_SCENE_FOCUS)
}
