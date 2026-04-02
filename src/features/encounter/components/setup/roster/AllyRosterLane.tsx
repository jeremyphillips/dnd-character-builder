import Stack from '@mui/material/Stack'

import type { Monster } from '@/features/content/monsters/domain/types'
import type { CombatantInstance } from '@/features/mechanics/domain/combat'
import type { CombatantPortraitEntry } from '@/features/encounter/helpers/combatants'
import { SelectedEntitiesLane } from '@/ui/patterns'

import { AllyCombatantSetupPreviewCard } from './AllyCombatantSetupPreviewCard'

type AllyRosterLaneProps = {
  selectedAllyIds: string[]
  monstersById: Record<string, Monster>
  characterPortraitById: Record<string, CombatantPortraitEntry>
  onOpenModal: () => void
  onResolvedCombatant: (runtimeId: string, combatant: CombatantInstance | null) => void
  onRemoveAllyCombatant: (characterId: string) => void
}

export function AllyRosterLane({
  selectedAllyIds,
  monstersById,
  characterPortraitById,
  onOpenModal,
  onResolvedCombatant,
  onRemoveAllyCombatant,
}: AllyRosterLaneProps) {
  return (
    <SelectedEntitiesLane
      title="Allies"
      description="Choose approved allies to include as combatants with initiative, AC, HP, attacks, and surfaced active effects."
      actionLabel="Add Allies"
      onAction={onOpenModal}
      emptyMessage="No ally combatants selected yet."
      hasSelection={selectedAllyIds.length > 0}
    >
      <Stack spacing={1.5}>
        {selectedAllyIds.map((characterId) => (
          <AllyCombatantSetupPreviewCard
            key={characterId}
            characterId={characterId}
            runtimeId={characterId}
            side="party"
            sourceKind="pc"
            monstersById={monstersById}
            characterPortraitById={characterPortraitById}
            onResolved={(combatant) => onResolvedCombatant(characterId, combatant)}
            onRemove={() => onRemoveAllyCombatant(characterId)}
          />
        ))}
      </Stack>
    </SelectedEntitiesLane>
  )
}
