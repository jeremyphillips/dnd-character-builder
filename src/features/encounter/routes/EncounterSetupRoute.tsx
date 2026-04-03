/**
 * Encounter Simulator setup route: redirects when combat is active; otherwise renders simulator setup surface.
 */
import { Navigate } from 'react-router-dom'

import { EncounterView, SimulatorEncounterSetupSurface } from '../components'
import { campaignEncounterActivePath } from './encounterPaths'
import { useEncounterRuntime } from './EncounterRuntimeContext'

export default function EncounterSetupRoute() {
  const {
    encounterState,
    campaignId,
    setupHeader,
    locations,
    buildingLocationIds,
    setBuildingLocationIds,
    buildingSelectOptions,
    environmentSetup,
    setEnvironmentSetup,
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

  if (encounterState && campaignId) {
    return <Navigate to={campaignEncounterActivePath(campaignId)} replace />
  }

  return (
    <EncounterView mode="setup" setupHeader={setupHeader}>
      <SimulatorEncounterSetupSurface
        environmentSetup={environmentSetup}
        onEnvironmentSetupChange={setEnvironmentSetup}
        locations={locations}
        buildingLocationIds={buildingLocationIds}
        onBuildingLocationIdsChange={setBuildingLocationIds}
        buildingSelectOptions={buildingSelectOptions}
        campaignId={campaignId}
        onOpenAllyModal={() => setAllyModalOpen(true)}
        onOpenOpponentModal={() => setOpponentModalOpen(true)}
        selectedAllyIds={selectedAllyIds}
        monstersById={monstersById}
        characterPortraitById={characterPortraitById}
        onResolvedCombatant={handleResolvedCombatant}
        onRemoveAllyCombatant={removeAllyCombatant}
        opponentRoster={opponentRoster}
        environmentContext={environmentContext}
        monsterFormsById={monsterFormsById}
        monsterManualTriggersById={monsterManualTriggersById}
        opponentSourceCounts={opponentSourceCounts}
        selectedOpponentOptions={selectedOpponentOptions}
        onRemoveOpponentCombatant={removeOpponentCombatant}
        onAddOpponentCopy={addOpponentCopy}
      />
    </EncounterView>
  )
}
