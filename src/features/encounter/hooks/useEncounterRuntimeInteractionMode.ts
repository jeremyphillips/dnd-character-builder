import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'

import type { CombatActionDefinition } from '@/features/mechanics/domain/combat/resolution/combat-action.types'

import { isAreaGridAction } from '../helpers/actions'
import type { GridInteractionMode } from '../domain'
import type { AoeStep } from '../helpers/actions'

export type UseEncounterRuntimeInteractionModeArgs = {
  activeCombatantId: string | null
  aoeStep: AoeStep
  selectedAction: CombatActionDefinition | null
  selectedCasterOptions: Record<string, string>
}

/**
 * Encounter **runtime** interaction-mode policy shared by session and simulator hosts: reset targeting
 * when the active combatant changes, and sync `aoe-place` vs `select-target` with AOE resolution step.
 */
export function useEncounterRuntimeInteractionMode({
  activeCombatantId,
  aoeStep,
  selectedAction,
  selectedCasterOptions,
}: UseEncounterRuntimeInteractionModeArgs): {
  interactionMode: GridInteractionMode
  setInteractionMode: Dispatch<SetStateAction<GridInteractionMode>>
} {
  const [interactionMode, setInteractionMode] = useState<GridInteractionMode>('select-target')

  useEffect(() => {
    setInteractionMode('select-target')
  }, [activeCombatantId])

  useEffect(() => {
    if (aoeStep === 'none' && interactionMode === 'aoe-place') {
      setInteractionMode('select-target')
    }
  }, [aoeStep, interactionMode])

  useEffect(() => {
    if (aoeStep === 'none') return
    if (isAreaGridAction(selectedAction, selectedCasterOptions)) {
      setInteractionMode('aoe-place')
    }
  }, [aoeStep, selectedAction, selectedCasterOptions])

  return { interactionMode, setInteractionMode }
}
