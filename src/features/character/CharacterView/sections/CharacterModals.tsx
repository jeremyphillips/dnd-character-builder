import type { CharacterDoc } from '@/shared'
import type { EditionId } from '@/data'
import type { LevelUpResult } from '@/features/levelUp'
import { AwardXpModal } from '@/domain/character/components/AwardXpModal'
import { ConfirmModal } from '@/ui/modals'
import { LevelUpWizard } from '@/features/levelUp'

type CharacterModalsProps = {
  character: CharacterDoc
  currentLevel: number
  maxLevel: number
  primaryClassId: string | undefined
  activeCampaignCount: number
  isOwner: boolean
  isAdmin: boolean

  awardXpOpen: boolean
  onAwardXpClose: () => void
  onAwardXp: (params: { newXp: number; triggersLevelUp: boolean; pendingLevel?: number }) => Promise<void>

  levelUpOpen: boolean
  onLevelUpClose: () => void
  onLevelUpComplete: (result: LevelUpResult) => Promise<void>

  cancelLevelUpOpen: boolean
  onCancelLevelUpClose: () => void
  onCancelLevelUp: () => Promise<void>

  deleteOpen: boolean
  onDeleteClose: () => void
  onDeleteConfirm: () => Promise<void>

  statusAction: {
    campaignMemberId: string
    campaignName: string
    newStatus: 'inactive' | 'deceased'
  } | null
  onStatusActionClose: () => void
  onStatusActionConfirm: () => Promise<void>
}

export default function CharacterModals({
  character,
  currentLevel,
  maxLevel,
  primaryClassId,
  activeCampaignCount,
  isOwner,
  isAdmin,
  awardXpOpen,
  onAwardXpClose,
  onAwardXp,
  levelUpOpen,
  onLevelUpClose,
  onLevelUpComplete,
  cancelLevelUpOpen,
  onCancelLevelUpClose,
  onCancelLevelUp,
  deleteOpen,
  onDeleteClose,
  onDeleteConfirm,
  statusAction,
  onStatusActionClose,
  onStatusActionConfirm,
}: CharacterModalsProps) {
  return (
    <>
      {/* Award XP modal */}
      <AwardXpModal
        open={awardXpOpen}
        onClose={onAwardXpClose}
        characterName={character.name}
        currentXp={character.xp ?? 0}
        currentLevel={currentLevel}
        editionId={character.edition as EditionId}
        primaryClassId={primaryClassId}
        maxLevel={maxLevel}
        onAward={onAwardXp}
      />

      {/* Level-up wizard */}
      {character.levelUpPending && character.pendingLevel && (
        <LevelUpWizard
          open={levelUpOpen}
          onClose={onLevelUpClose}
          character={character}
          onComplete={onLevelUpComplete}
        />
      )}

      {/* Cancel level-up confirmation */}
      <ConfirmModal
        open={cancelLevelUpOpen}
        onCancel={onCancelLevelUpClose}
        onConfirm={onCancelLevelUp}
        headline="Cancel Level-Up"
        description={`This will cancel the pending advancement to level ${character.pendingLevel} and revert ${character.name}'s XP to the level ${currentLevel} threshold. You can re-award XP afterward.`}
        confirmLabel="Cancel Level-Up"
        confirmColor="error"
      />

      {/* Delete character confirmation */}
      <ConfirmModal
        open={deleteOpen}
        onCancel={onDeleteClose}
        onConfirm={onDeleteConfirm}
        headline="Delete Character"
        description={
          activeCampaignCount > 0
            ? `This will remove ${character.name} from ${activeCampaignCount} active campaign${activeCampaignCount !== 1 ? 's' : ''} and notify party members. Campaign history will be preserved, but you will no longer be able to access this character.`
            : `This will permanently delete ${character.name}. This action cannot be undone.`
        }
        confirmLabel="Delete Character"
        confirmColor="error"
      />

      {/* Character status change confirmation */}
      <ConfirmModal
        open={!!statusAction}
        onCancel={onStatusActionClose}
        onConfirm={onStatusActionConfirm}
        headline={
          statusAction?.newStatus === 'deceased'
            ? 'Mark Character as Deceased'
            : isOwner && !isAdmin
              ? 'Leave Campaign'
              : 'Set Character Inactive'
        }
        description={
          statusAction?.newStatus === 'deceased'
            ? `This will mark ${character.name} as deceased in ${statusAction?.campaignName ?? 'the campaign'}. All party members will be notified.`
            : isOwner && !isAdmin
              ? `This will remove ${character.name} from ${statusAction?.campaignName ?? 'the campaign'}. All party members will be notified.`
              : `This will set ${character.name} as inactive in ${statusAction?.campaignName ?? 'the campaign'}. All party members will be notified.`
        }
        confirmLabel={
          statusAction?.newStatus === 'deceased'
            ? 'Mark Deceased'
            : isOwner && !isAdmin
              ? 'Leave Campaign'
              : 'Set Inactive'
        }
        confirmColor={statusAction?.newStatus === 'deceased' ? 'error' : 'warning'}
      />
    </>
  )
}
