import { createElement, useMemo, type ReactNode } from 'react'

import type { EncounterSessionSeat } from '@/features/mechanics/domain/combat/selectors/capabilities/encounter-capabilities.types'

import { EncounterSceneViewerControls } from '../components/active/scene/EncounterSceneViewerControls'
import { resolveViewerSceneEncounterState } from '../domain'
import { useEncounterSceneViewer, type UseEncounterSceneViewerArgs } from './useEncounterSceneViewer'

/**
 * Whether the scene viewer **control strip** (manual scene / camera) should mount.
 *
 * - **Simulator** — single-operator sandbox; always show controls during active encounter.
 * - **Session** — DM only; players/observers keep local presentation state but do not get the strip.
 *
 * Underlying {@link useEncounterSceneViewer} still runs for all session viewers so grid POV stays correct.
 */
export function resolveEncounterSceneViewerControlsVisibility(
  hostMode: UseEncounterSceneViewerArgs['hostMode'],
  viewerRole: EncounterSessionSeat,
): boolean {
  if (hostMode === 'simulator') return true
  return viewerRole === 'dm'
}

/**
 * Shared composition for encounter scene-viewer presentation: local follow/scene focus, derived
 * presentation {@link EncounterState}, and the optional header slot for {@link EncounterSceneViewerControls}.
 *
 * Session and simulator hosts both use this so orchestration and visibility policy stay in sync.
 *
 * This file is `.ts` (not `.tsx`) so Vite resolves extensionless imports to a real module: some setups
 * resolve `useEncounterSceneViewerPresentation` to `.ts` before `.tsx`, which 404s if only `.tsx` exists.
 */
export function useEncounterSceneViewerPresentation(args: UseEncounterSceneViewerArgs): {
  followMode: ReturnType<typeof useEncounterSceneViewer>['followMode']
  setFollowMode: ReturnType<typeof useEncounterSceneViewer>['setFollowMode']
  sceneFocus: ReturnType<typeof useEncounterSceneViewer>['sceneFocus']
  setSceneFocus: ReturnType<typeof useEncounterSceneViewer>['setSceneFocus']
  presentationEncounterState: ReturnType<typeof resolveViewerSceneEncounterState>
  sceneViewerSlot: ReactNode
  canRenderSceneViewerControls: boolean
} {
  const { followMode, setFollowMode, sceneFocus, setSceneFocus } = useEncounterSceneViewer(args)

  const presentationEncounterState = useMemo(
    () => resolveViewerSceneEncounterState(args.encounterState, sceneFocus),
    [args.encounterState, sceneFocus],
  )

  const canRenderSceneViewerControls = useMemo(
    () => resolveEncounterSceneViewerControlsVisibility(args.hostMode, args.viewerRole),
    [args.hostMode, args.viewerRole],
  )

  const sceneViewerSlot = useMemo(
    () =>
      args.encounterState && canRenderSceneViewerControls
        ? createElement(EncounterSceneViewerControls, {
            encounterState: args.encounterState,
            sceneFocus,
            setSceneFocus,
            followMode,
            setFollowMode,
          })
        : null,
    [
      args.encounterState,
      canRenderSceneViewerControls,
      sceneFocus,
      setSceneFocus,
      followMode,
      setFollowMode,
    ],
  )

  return {
    followMode,
    setFollowMode,
    sceneFocus,
    setSceneFocus,
    presentationEncounterState,
    sceneViewerSlot,
    canRenderSceneViewerControls,
  }
}
