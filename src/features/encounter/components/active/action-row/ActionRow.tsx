import { useParams } from 'react-router-dom'
import Typography from '@mui/material/Typography'

import { ROUTES } from '@/app/routes'
import { CombatActionRowBase } from '@/features/combat/components'
import type { CombatActionDefinition } from '@/features/mechanics/domain/combat/resolution/combat-action.types'
import { deriveActionPresentation } from '@/features/mechanics/domain/combat/presentation/actions/action-presentation'

type ActionRowProps = {
  action: CombatActionDefinition
  isSelected: boolean
  isAvailable?: boolean
  onSelect?: () => void
}

export function ActionRow({ action, isSelected, isAvailable = true, onSelect }: ActionRowProps) {
  const { id: campaignId } = useParams<{ id: string }>()
  const vm = deriveActionPresentation(action)

  const footerActionTo =
    vm.footerLink?.spellId && campaignId
      ? ROUTES.WORLD_SPELL.replace(':id', campaignId).replace(':spellId', vm.footerLink.spellId)
      : undefined

  return (
    <CombatActionRowBase
      isSelected={isSelected}
      isAvailable={isAvailable}
      onSelect={onSelect}
      name={vm.displayName}
      secondLine={
        vm.secondLine
          ? <Typography variant="caption" color="text.secondary">{vm.secondLine}</Typography>
          : undefined
      }
      badges={vm.badges}
      footerActionTo={footerActionTo}
      footerActionLabel={vm.footerLink?.label}
      footerActionOpenInNewTab={footerActionTo != null ? true : undefined}
    />
  )
}
