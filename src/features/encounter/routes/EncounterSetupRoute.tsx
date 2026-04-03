/**
 * Encounter configuration (participants, environment, grid). DM/simulator-only surface — not player lobby.
 */
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'

import type { Location } from '@/features/content/locations/domain/types'
import { listCampaignLocations } from '@/features/content/locations/domain/repo/locationRepo'
import type { SelectEntityOption } from '@/ui/patterns'
import {
  AllyRosterLane,
  EncounterEnvironmentSetup,
  EncounterGridSetup,
  EncounterSetupView,
  EncounterView,
  OpponentRosterLane,
} from '../components'
import { EncounterSetupBuildingLocation } from '../components/setup/options/EncounterSetupBuildingLocation'
import { campaignEncounterActivePath } from './encounterPaths'
import { useEncounterRuntime } from './EncounterRuntimeContext'

export default function EncounterSetupRoute() {
  const {
    encounterState,
    campaignId,
    setupHeader,
    environmentSetup,
    setEnvironmentSetup,
    gridSizePreset,
    setGridSizePreset,
    selectedAllyIds,
    setAllyModalOpen,
    handleResolvedCombatant,
    removeAllyCombatant,
    opponentRoster,
    monstersById,
    characterPortraitById,
    environmentContext,
    monsterFormsById,
    monsterManualTriggersById,
    opponentSourceCounts,
    selectedOpponentOptions,
    setOpponentModalOpen,
    removeOpponentCombatant,
    addOpponentCopy,
  } = useEncounterRuntime()

  const [locations, setLocations] = useState<Location[]>([])
  const [buildingLocationIds, setBuildingLocationIds] = useState<string[]>([])

  useEffect(() => {
    if (!campaignId) return
    let cancelled = false
    listCampaignLocations(campaignId)
      .then((locs) => {
        if (!cancelled) setLocations(locs)
      })
      .catch(() => {
        if (!cancelled) setLocations([])
      })
    return () => {
      cancelled = true
    }
  }, [campaignId])

  const buildingSelectOptions: SelectEntityOption[] = useMemo(
    () =>
      locations
        .filter((l) => l.scale === 'building')
        .map((l) => ({
          id: l.id,
          label: l.name,
          subtitle: l.category,
          imageKey: l.imageKey ?? null,
        })),
    [locations],
  )

  if (encounterState && campaignId) {
    return <Navigate to={campaignEncounterActivePath(campaignId)} replace />
  }

  return (
    <EncounterView mode="setup" setupHeader={setupHeader}>
      <EncounterSetupView
        environmentSetup={
          <EncounterEnvironmentSetup
            values={environmentSetup}
            onChange={setEnvironmentSetup}
            buildingLocationSlot={
              <EncounterSetupBuildingLocation
                selectedBuildingIds={buildingLocationIds}
                onChange={setBuildingLocationIds}
                locations={locations}
                buildingSelectOptions={buildingSelectOptions}
                campaignId={campaignId}
              />
            }
          />
        }
        gridSetup={<EncounterGridSetup value={gridSizePreset} onChange={setGridSizePreset} />}
        allyLane={
          <AllyRosterLane
            selectedAllyIds={selectedAllyIds}
            monstersById={monstersById}
            characterPortraitById={characterPortraitById}
            onOpenModal={() => setAllyModalOpen(true)}
            onResolvedCombatant={handleResolvedCombatant}
            onRemoveAllyCombatant={removeAllyCombatant}
          />
        }
        opponentLane={
          <OpponentRosterLane
            opponentRoster={opponentRoster}
            monstersById={monstersById}
            characterPortraitById={characterPortraitById}
            environmentContext={environmentContext}
            monsterFormsById={monsterFormsById}
            monsterManualTriggersById={monsterManualTriggersById}
            opponentSourceCounts={opponentSourceCounts}
            selectedOpponentOptions={selectedOpponentOptions}
            onOpenModal={() => setOpponentModalOpen(true)}
            onResolvedCombatant={handleResolvedCombatant}
            onRemoveOpponentCombatant={removeOpponentCombatant}
            onAddOpponentCopy={addOpponentCopy}
          />
        }
      />
    </EncounterView>
  )
}
