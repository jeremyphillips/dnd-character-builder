import { useRef } from 'react'
import { Link } from 'react-router-dom'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { useActiveCampaign } from '@/app/providers/ActiveCampaignProvider'
import { useCampaignRules } from '@/app/providers/CampaignRulesProvider'
import { ROUTES } from '@/app/routes'
import { useCampaignParty } from '@/features/campaign/hooks'
import { useCharacters } from '@/features/character/hooks'
import { AppAlert } from '@/ui/primitives'
import { useEncounterState, useEncounterOptions, useEncounterRoster } from '../hooks'
import { CombatLogPanel, EncounterControlsPanel, OpponentRosterLane, AllyRosterLane } from '../components'

export default function EncounterRoute() {
  const { campaignId, campaignName } = useActiveCampaign()
  const { catalog } = useCampaignRules()
  const { party, loading: loadingParty } = useCampaignParty('approved')
  const { characters: npcs, loading: loadingNpcs } = useCharacters({ type: 'npc' })

  const runtimeIdCounter = useRef(0)
  const nextRuntimeId = (prefix: string) => {
    runtimeIdCounter.current += 1
    return `${prefix}-${runtimeIdCounter.current}`
  }

  const monstersById = catalog.monstersById
  const { allyOptions, opponentOptions, opponentOptionsByKey } = useEncounterOptions({
    allies: party,
    npcs,
    monstersById,
  })

  const {
    selectedAllyIds,
    setSelectedAllyIds,
    opponentRoster,
    selectedAllyOptions,
    selectedOpponentOptions,
    opponentSourceCounts,
    selectedCombatantIds,
    handleOpponentSelectionChange,
    removeAllyCombatant,
    removeOpponentCombatant,
    addOpponentCopy,
  } = useEncounterRoster({
    allyOptions,
    opponentOptionsByKey,
    nextRuntimeId,
  })
  const {
    encounterState,
    activeCombatantId,
    activeCombatant,
    availableActions,
    availableActionTargets,
    selectedActionId,
    setSelectedActionId,
    selectedActionTargetId,
    setSelectedActionTargetId,
    unresolvedCombatantCount,
    selectedCombatants,
    controlTargetId,
    setControlTargetId,
    damageAmount,
    setDamageAmount,
    damageTypeInput,
    setDamageTypeInput,
    healingAmount,
    setHealingAmount,
    conditionInput,
    setConditionInput,
    stateInput,
    setStateInput,
    markerDurationTurns,
    setMarkerDurationTurns,
    markerDurationBoundary,
    setMarkerDurationBoundary,
    environmentContext,
    setEnvironmentContext,
    monsterFormsById,
    monsterManualTriggersById,
    reducedToZeroSaveOutcome,
    setReducedToZeroSaveOutcome,
    controlTargetHasReducedToZeroSave,
    canTriggerReducedToZeroHook,
    handleResolvedCombatant,
    handleStartEncounter,
    handleNextTurn,
    handleResolveAction,
    handleResetEncounter,
    handleApplyDamage,
    handleApplyHealing,
    handleAddCondition,
    handleRemoveCondition,
    handleAddState,
    handleRemoveState,
    handleTriggerReducedToZeroHook,
    handleMonsterFormChange,
    handleMonsterManualTriggerChange,
  } = useEncounterState({
    selectedCombatantIds,
    opponentRoster,
    monstersById,
  })

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Box>
          <Typography variant="h4">Encounter</Typography>
          <Typography variant="body1" color="text.secondary">
            {campaignName ? `${campaignName} encounter sandbox` : 'Encounter sandbox'}
          </Typography>
        </Box>
        <Button
          component={Link}
          to={campaignId ? ROUTES.CAMPAIGN.replace(':id', campaignId) : ROUTES.CAMPAIGNS}
          startIcon={<ArrowBackIcon />}
          size="small"
        >
          Campaign
        </Button>
      </Stack>

      <AppAlert tone="info">
        This slice loads approved allies, campaign NPCs, and monsters into the sandbox, then starts a local encounter with auto-rolled initiative and a structured turn log.
      </AppAlert>

      <EncounterControlsPanel
        selectedCombatantCount={selectedCombatantIds.length}
        resolvedCombatantCount={selectedCombatants.length}
        unresolvedCombatantCount={unresolvedCombatantCount}
        encounterState={encounterState}
        activeCombatant={activeCombatant}
        canStartEncounter={selectedCombatants.length > 0 && unresolvedCombatantCount === 0}
        onStartEncounter={handleStartEncounter}
        onNextTurn={handleNextTurn}
        onResetEncounter={handleResetEncounter}
        environmentContext={environmentContext}
        onEnvironmentContextChange={setEnvironmentContext}
        controlTargetId={controlTargetId}
        onControlTargetIdChange={setControlTargetId}
        damageAmount={damageAmount}
        onDamageAmountChange={setDamageAmount}
        damageTypeInput={damageTypeInput}
        onDamageTypeInputChange={setDamageTypeInput}
        onApplyDamage={handleApplyDamage}
        healingAmount={healingAmount}
        onHealingAmountChange={setHealingAmount}
        onApplyHealing={handleApplyHealing}
        controlTargetHasReducedToZeroSave={controlTargetHasReducedToZeroSave}
        reducedToZeroSaveOutcome={reducedToZeroSaveOutcome}
        onReducedToZeroSaveOutcomeChange={setReducedToZeroSaveOutcome}
        onTriggerReducedToZeroHook={handleTriggerReducedToZeroHook}
        canTriggerReducedToZeroHook={canTriggerReducedToZeroHook}
        conditionInput={conditionInput}
        onConditionInputChange={setConditionInput}
        onAddCondition={handleAddCondition}
        onRemoveCondition={handleRemoveCondition}
        stateInput={stateInput}
        onStateInputChange={setStateInput}
        onAddState={handleAddState}
        onRemoveState={handleRemoveState}
        markerDurationTurns={markerDurationTurns}
        onMarkerDurationTurnsChange={setMarkerDurationTurns}
        markerDurationBoundary={markerDurationBoundary}
        onMarkerDurationBoundaryChange={setMarkerDurationBoundary}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
          gap: 3,
        }}
      >
        <AllyRosterLane
          allyOptions={allyOptions}
          selectedAllyOptions={selectedAllyOptions}
          selectedAllyIds={selectedAllyIds}
          loadingAllies={loadingParty}
          encounterState={encounterState}
          activeCombatantId={activeCombatantId}
          availableActions={availableActions}
          availableActionTargets={availableActionTargets}
          selectedActionId={selectedActionId}
          onSelectedActionIdChange={setSelectedActionId}
          selectedActionTargetId={selectedActionTargetId}
          onSelectedActionTargetIdChange={setSelectedActionTargetId}
          onResolveAction={handleResolveAction}
          onPassTurn={handleNextTurn}
          onAllySelectionChange={setSelectedAllyIds}
          onResolvedCombatant={handleResolvedCombatant}
          onRemoveAllyCombatant={removeAllyCombatant}
        />

        <OpponentRosterLane
          opponentOptions={opponentOptions}
          selectedOpponentOptions={selectedOpponentOptions}
          opponentRoster={opponentRoster}
          loadingOpponents={loadingNpcs}
          monstersById={monstersById}
          encounterState={encounterState}
          activeCombatantId={activeCombatantId}
          availableActions={availableActions}
          availableActionTargets={availableActionTargets}
          selectedActionId={selectedActionId}
          onSelectedActionIdChange={setSelectedActionId}
          selectedActionTargetId={selectedActionTargetId}
          onSelectedActionTargetIdChange={setSelectedActionTargetId}
          onResolveAction={handleResolveAction}
          onPassTurn={handleNextTurn}
          environmentContext={environmentContext}
          monsterFormsById={monsterFormsById}
          monsterManualTriggersById={monsterManualTriggersById}
          opponentSourceCounts={opponentSourceCounts}
          onOpponentSelectionChange={handleOpponentSelectionChange}
          onResolvedCombatant={handleResolvedCombatant}
          onRemoveOpponentCombatant={removeOpponentCombatant}
          onAddOpponentCopy={addOpponentCopy}
          onMonsterFormChange={handleMonsterFormChange}
          onMonsterManualTriggerChange={handleMonsterManualTriggerChange}
        />
      </Box>

      <CombatLogPanel
        encounterState={encounterState}
        selectedAllyCount={selectedAllyIds.length}
        opponentCombatantCount={opponentRoster.length}
      />
    </Stack>
  )
}
