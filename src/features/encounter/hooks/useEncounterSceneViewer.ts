import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import type { EncounterState } from '@/features/mechanics/domain/combat'
import type { EncounterSessionSeat } from '@/features/mechanics/domain/combat/selectors/capabilities/encounter-capabilities.types'
import { getEncounterSpaceForCombatant } from '@/features/mechanics/domain/combat/space/encounter-spaces'

import type { SceneFocus } from '../domain/sceneFocus.types'
import type { SceneViewerFollowMode } from '../domain/sceneViewer.types'

export type UseEncounterSceneViewerArgs = {
  encounterState: EncounterState | null
  /** Session: PCs this viewer controls; simulator: usually empty (use follow selected). */
  controlledCombatantIds: readonly string[]
  selectedActionTargetId: string
  /** Simulator “selected combatant” POV; session may omit. */
  presentationSelectedCombatantId: string | null
  activeCombatantId: string | null
  viewerRole: EncounterSessionSeat
  hostMode: 'session' | 'simulator'
}

/**
 * Viewer-local scene focus + follow mode (Phase C).
 *
 * Defaults:
 * - **Session DM** — `followSelectedCombatant` (track presentation/action target / active).
 * - **Session player with controlled PCs** — `followControlledCombatant`.
 * - **Session observer / no controlled** — `followSelectedCombatant`.
 * - **Simulator** — `followSelectedCombatant` (presentation selection drives scene).
 *
 * Initial `sceneFocus` pins the current authoritative tactical space once loaded so presentation
 * does not depend on “global” space alone after multi-space mechanics.
 */
export function useEncounterSceneViewer({
  encounterState,
  controlledCombatantIds,
  selectedActionTargetId,
  presentationSelectedCombatantId,
  activeCombatantId,
  viewerRole,
  hostMode,
}: UseEncounterSceneViewerArgs): {
  followMode: SceneViewerFollowMode
  setFollowMode: Dispatch<SetStateAction<SceneViewerFollowMode>>
  sceneFocus: SceneFocus
  setSceneFocus: Dispatch<SetStateAction<SceneFocus>>
} {
  const [followMode, setFollowMode] = useState<SceneViewerFollowMode>('followSelectedCombatant')
  const [sceneFocus, setSceneFocus] = useState<SceneFocus>({ kind: 'followEncounterSpace' })

  const defaultsAppliedRef = useRef(false)

  useEffect(() => {
    if (!encounterState?.space?.id) {
      defaultsAppliedRef.current = false
    }
  }, [encounterState?.space?.id])

  const defaultFollowMode = useMemo((): SceneViewerFollowMode => {
    if (hostMode === 'session' && viewerRole === 'dm') return 'followSelectedCombatant'
    if (controlledCombatantIds.length > 0) return 'followControlledCombatant'
    return 'followSelectedCombatant'
  }, [hostMode, viewerRole, controlledCombatantIds.length])

  /** One-time: set follow mode + pin initial scene from authoritative space. */
  useEffect(() => {
    if (!encounterState?.space?.id || defaultsAppliedRef.current) return
    defaultsAppliedRef.current = true
    setFollowMode(defaultFollowMode)
    setSceneFocus({
      kind: 'pinnedScene',
      encounterSpaceId: encounterState.space.id,
      sceneLocationId: encounterState.space.locationId ?? null,
    })
  }, [encounterState?.space?.id, encounterState?.space?.locationId, defaultFollowMode])

  const resolveFollowTargetCombatantId = useCallback((): string | null => {
    if (!encounterState) return null
    if (followMode === 'followControlledCombatant') {
      if (controlledCombatantIds.length === 0) return activeCombatantId
      if (activeCombatantId && controlledCombatantIds.includes(activeCombatantId)) return activeCombatantId
      return controlledCombatantIds[0] ?? null
    }
    if (followMode === 'followSelectedCombatant') {
      const pres = presentationSelectedCombatantId
      if (pres && encounterState.combatantsById[pres]) return pres
      if (selectedActionTargetId && encounterState.combatantsById[selectedActionTargetId]) {
        return selectedActionTargetId
      }
      return activeCombatantId
    }
    return null
  }, [
    encounterState,
    followMode,
    controlledCombatantIds,
    activeCombatantId,
    presentationSelectedCombatantId,
    selectedActionTargetId,
  ])

  /** Follow modes: move `sceneFocus` when the followed combatant’s authoritative space changes. */
  useEffect(() => {
    if (!defaultsAppliedRef.current || followMode === 'manual' || !encounterState?.space) return
    const cid = resolveFollowTargetCombatantId()
    if (!cid) return
    const space = getEncounterSpaceForCombatant(encounterState, cid)
    if (!space?.id) return
    setSceneFocus((prev) => {
      if (prev.kind !== 'pinnedScene') {
        return { kind: 'pinnedScene', encounterSpaceId: space.id, sceneLocationId: space.locationId ?? null }
      }
      if (prev.encounterSpaceId === space.id) return prev
      return { kind: 'pinnedScene', encounterSpaceId: space.id, sceneLocationId: space.locationId ?? null }
    })
  }, [followMode, encounterState, resolveFollowTargetCombatantId])

  return { followMode, setFollowMode, sceneFocus, setSceneFocus }
}
