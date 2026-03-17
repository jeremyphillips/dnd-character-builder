import { AppBadge } from '@/ui/primitives'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import type { Monster } from '@/features/content/monsters/domain/types'
import { DEFAULT_MANUAL_MONSTER_TRIGGER_CONTEXT, type CombatantInstance, type ManualEnvironmentContext, type ManualMonsterTriggerContext, type MonsterFormContext } from '@/features/mechanics/domain/encounter'
import type { OpponentOption, OpponentRosterEntry, AllyOption } from '../types'
import { CharacterCombatantCard, CombatLane, MonsterCombatantCard } from './CombatSimulationCards'

type AllyLaneProps = {
  allyOptions: AllyOption[]
  selectedAllyOptions: AllyOption[]
  selectedAllyIds: string[]
  loadingAllies: boolean
  encounterState: { combatantsById: Record<string, CombatantInstance> } | null
  activeCombatantId: string | null
  availableActions: { id: string; label: string; resolutionMode: string; kind: string }[]
  availableActionTargets: { id: string; label: string }[]
  selectedActionId: string
  onSelectedActionIdChange: (value: string) => void
  selectedActionTargetId: string
  onSelectedActionTargetIdChange: (value: string) => void
  onResolveAction: () => void
  onPassTurn: () => void
  onAllySelectionChange: (ids: string[]) => void
  onResolvedCombatant: (runtimeId: string, combatant: CombatantInstance | null) => void
  onRemoveAllyCombatant: (characterId: string) => void
}

export function AllyRosterLane({
  allyOptions,
  selectedAllyOptions,
  selectedAllyIds,
  loadingAllies,
  encounterState,
  activeCombatantId,
  availableActions,
  availableActionTargets,
  selectedActionId,
  onSelectedActionIdChange,
  selectedActionTargetId,
  onSelectedActionTargetIdChange,
  onResolveAction,
  onPassTurn,
  onAllySelectionChange,
  onResolvedCombatant,
  onRemoveAllyCombatant,
}: AllyLaneProps) {
  return (
    <CombatLane
      title="Allies"
      description="Choose approved allies to append PC combatant cards with initiative, AC, HP, attacks, and surfaced active effects."
    >
      <Autocomplete<AllyOption, true, false, false>
        multiple
        options={allyOptions}
        value={selectedAllyOptions}
        loading={loadingAllies}
        onChange={(_, nextValue) => onAllySelectionChange(nextValue.map((option) => option.id))}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        getOptionLabel={(option) => option.label}
        noOptionsText="No approved allies found."
        renderOption={(props, option) => {
          const { key, ...rest } = props
          return (
            <Box component="li" key={key} {...rest}>
              <Stack spacing={0.25}>
                <Typography variant="body2">{option.label}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.subtitle}
                </Typography>
              </Stack>
            </Box>
          )
        }}
        renderInput={(params) => (
          <TextField {...params} label="Approved Allies" placeholder="Search allies" />
        )}
      />

      <Stack spacing={2}>
        {selectedAllyIds.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No ally combatants selected yet.
          </Typography>
        ) : (
          selectedAllyIds.map((characterId) => (
            <CharacterCombatantCard
              key={characterId}
              runtimeId={characterId}
              characterId={characterId}
              side="party"
              sourceKind="pc"
              runtimeCombatant={encounterState?.combatantsById[characterId]}
              onResolved={(combatant) => onResolvedCombatant(characterId, combatant)}
              onRemove={() => onRemoveAllyCombatant(characterId)}
              onPassTurn={onPassTurn}
              isActive={activeCombatantId === characterId}
              activeActionControls={
                activeCombatantId === characterId
                  ? {
                      availableActions,
                      availableTargets: availableActionTargets,
                      selectedActionId,
                      onSelectedActionIdChange,
                      selectedTargetId: selectedActionTargetId,
                      onSelectedTargetIdChange: onSelectedActionTargetIdChange,
                      onResolveAction,
                    }
                  : undefined
              }
            />
          ))
        )}
      </Stack>
    </CombatLane>
  )
}

type OpponentLaneProps = {
  opponentOptions: OpponentOption[]
  selectedOpponentOptions: OpponentOption[]
  opponentRoster: OpponentRosterEntry[]
  loadingOpponents: boolean
  monstersById: Record<string, Monster>
  encounterState: { combatantsById: Record<string, CombatantInstance> } | null
  activeCombatantId: string | null
  availableActions: { id: string; label: string; resolutionMode: string; kind: string }[]
  availableActionTargets: { id: string; label: string }[]
  selectedActionId: string
  onSelectedActionIdChange: (value: string) => void
  selectedActionTargetId: string
  onSelectedActionTargetIdChange: (value: string) => void
  onResolveAction: () => void
  onPassTurn: () => void
  environmentContext: ManualEnvironmentContext
  monsterFormsById: Record<string, MonsterFormContext>
  monsterManualTriggersById: Record<string, ManualMonsterTriggerContext>
  opponentSourceCounts: Record<string, number>
  onOpponentSelectionChange: (nextValue: OpponentOption[]) => void
  onResolvedCombatant: (runtimeId: string, combatant: CombatantInstance | null) => void
  onRemoveOpponentCombatant: (runtimeId: string) => void
  onAddOpponentCopy: (entry: OpponentRosterEntry) => void
  onMonsterFormChange: (runtimeId: string, form: MonsterFormContext) => void
  onMonsterManualTriggerChange: (runtimeId: string, trigger: keyof ManualMonsterTriggerContext, active: boolean) => void
}

export function OpponentRosterLane({
  opponentOptions,
  selectedOpponentOptions,
  opponentRoster,
  loadingOpponents,
  monstersById,
  encounterState,
  activeCombatantId,
  availableActions,
  availableActionTargets,
  selectedActionId,
  onSelectedActionIdChange,
  selectedActionTargetId,
  onSelectedActionTargetIdChange,
  onResolveAction,
  onPassTurn,
  environmentContext,
  monsterFormsById,
  monsterManualTriggersById,
  opponentSourceCounts,
  onOpponentSelectionChange,
  onResolvedCombatant,
  onRemoveOpponentCombatant,
  onAddOpponentCopy,
  onMonsterFormChange,
  onMonsterManualTriggerChange,
}: OpponentLaneProps) {
  return (
    <CombatLane
      title="Opponents"
      description="Choose NPC or monster sources. Removing a source from the multiselect clears every copy, while selected monster cards can add duplicate runtime instances."
    >
      <Autocomplete<OpponentOption, true, false, false>
        multiple
        options={opponentOptions}
        value={selectedOpponentOptions}
        loading={loadingOpponents}
        onChange={(_, nextValue) => onOpponentSelectionChange(nextValue)}
        isOptionEqualToValue={(option, value) => option.key === value.key}
        getOptionLabel={(option) => option.label}
        noOptionsText="No NPC or monster options found."
        renderOption={(props, option) => {
          const { key, ...rest } = props
          return (
            <Box component="li" key={key} {...rest}>
              <Stack spacing={0.25}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">{option.label}</Typography>
                  <AppBadge label={option.kind === 'npc' ? 'NPC' : 'Monster'} tone="default" size="small" />
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {option.subtitle}
                </Typography>
              </Stack>
            </Box>
          )
        }}
        renderInput={(params) => (
          <TextField {...params} label="Opponent Sources" placeholder="Search NPCs and monsters" />
        )}
      />

      <Stack spacing={2}>
        {opponentRoster.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No opponent combatants selected yet.
          </Typography>
        ) : (
          opponentRoster.map((entry) => {
            if (entry.kind === 'npc') {
              return (
                <CharacterCombatantCard
                  key={entry.runtimeId}
                  runtimeId={entry.runtimeId}
                  characterId={entry.sourceId}
                  side="enemies"
                  sourceKind="npc"
                  runtimeCombatant={encounterState?.combatantsById[entry.runtimeId]}
                  onResolved={(combatant) => onResolvedCombatant(entry.runtimeId, combatant)}
                  onRemove={() => onRemoveOpponentCombatant(entry.runtimeId)}
                  onPassTurn={onPassTurn}
                  isActive={activeCombatantId === entry.runtimeId}
                  activeActionControls={
                    activeCombatantId === entry.runtimeId
                      ? {
                          availableActions,
                          availableTargets: availableActionTargets,
                          selectedActionId,
                          onSelectedActionIdChange,
                          selectedTargetId: selectedActionTargetId,
                          onSelectedTargetIdChange: onSelectedActionTargetIdChange,
                          onResolveAction,
                        }
                      : undefined
                  }
                />
              )
            }

            const monster = monstersById[entry.sourceId]
            if (!monster) {
              return (
                <Paper key={entry.runtimeId} sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="error">
                      Monster `{entry.sourceId}` could not be resolved.
                    </Typography>
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => onRemoveOpponentCombatant(entry.runtimeId)}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </Button>
                  </Stack>
                </Paper>
              )
            }

            return (
              <MonsterCombatantCard
                key={entry.runtimeId}
                monster={monster}
                runtimeId={entry.runtimeId}
                runtimeCombatant={encounterState?.combatantsById[entry.runtimeId]}
                environmentContext={environmentContext}
                currentForm={monsterFormsById[entry.runtimeId] ?? 'true-form'}
                manualTriggerContext={
                  monsterManualTriggersById[entry.runtimeId] ?? DEFAULT_MANUAL_MONSTER_TRIGGER_CONTEXT
                }
                onFormChange={(form) => onMonsterFormChange(entry.runtimeId, form)}
                onManualTriggerChange={(trigger, active) =>
                  onMonsterManualTriggerChange(entry.runtimeId, trigger, active)
                }
                onResolved={(combatant) => onResolvedCombatant(entry.runtimeId, combatant)}
                onAddCopy={() => onAddOpponentCopy(entry)}
                onRemove={() => onRemoveOpponentCombatant(entry.runtimeId)}
                onPassTurn={onPassTurn}
                isActive={activeCombatantId === entry.runtimeId}
                activeActionControls={
                  activeCombatantId === entry.runtimeId
                    ? {
                        availableActions,
                        availableTargets: availableActionTargets,
                        selectedActionId,
                        onSelectedActionIdChange,
                        selectedTargetId: selectedActionTargetId,
                        onSelectedTargetIdChange: onSelectedActionTargetIdChange,
                        onResolveAction,
                      }
                    : undefined
                }
              />
            )
          })
        )}
      </Stack>

      {selectedOpponentOptions.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {selectedOpponentOptions.map((option) => (
            <AppBadge
              key={option.key}
              label={`${option.label} × ${opponentSourceCounts[option.key] ?? 0}`}
              tone="default"
              variant="outlined"
              size="small"
            />
          ))}
        </Stack>
      )}
    </CombatLane>
  )
}
