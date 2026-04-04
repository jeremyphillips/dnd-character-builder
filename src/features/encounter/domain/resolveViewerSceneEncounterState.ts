import type { EncounterState } from '@/features/mechanics/domain/combat'

import { buildPresentationEncounterStateForFocusedSpace } from './buildPresentationEncounterStateForFocusedSpace'
import type { SceneFocus } from './sceneFocus.types'

/**
 * Resolves which {@link EncounterState} the **viewer’s** grid and scene-aligned presentation
 * should use, given authoritative encounter state and viewer-local {@link SceneFocus}.
 *
 * - **Authoritative** `EncounterState` from mechanics / hydration is always the truth for
 *   combat resolution, intents, and persistence (including multi-space `spacesById` + per-placement
 *   `encounterSpaceId` when present).
 * - **`pinnedScene`** — presentation uses that space from `spacesById` and filters placements to that scene.
 * - **`followEncounterSpace`** — presentation matches transitional `authoritative.space` (legacy single-grid).
 *
 * Callers should pass the result into grid view models, scene-aligned perception, and other
 * **display-only** paths — not into `applyCombatIntent` / persisted intent pipelines.
 */
export function resolveViewerSceneEncounterState(
  authoritative: EncounterState | null,
  sceneFocus: SceneFocus,
): EncounterState | null {
  if (!authoritative) return null

  switch (sceneFocus.kind) {
    case 'followEncounterSpace':
      return authoritative
    case 'pinnedScene': {
      if (!sceneFocus.encounterSpaceId) return authoritative
      return buildPresentationEncounterStateForFocusedSpace(authoritative, sceneFocus.encounterSpaceId)
    }
  }
}
