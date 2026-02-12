import type { AppNotification } from './notification.types'

export function getNotificationLabel(n: AppNotification): string {
  switch (n.type) {
    case 'campaign.invite':
      return `${n.payload.invitedByName ?? 'Someone'} invited you to ${n.payload.campaignName ?? 'a campaign'}`
    case 'character_pending_approval':
      return `${n.payload.userName ?? 'A player'} has a new character pending approval`
    case 'character_approved':
      return `Your character "${n.payload.characterName ?? ''}" was approved for ${n.payload.campaignName ?? 'the campaign'}`
    case 'character_rejected':
      return `Your character "${n.payload.characterName ?? ''}" was not approved for ${n.payload.campaignName ?? 'the campaign'}`
    case 'new_message':
      return 'You have a new message'
    case 'newPartyMember':
      return `${n.payload.characterName ?? 'A character'} has joined ${n.payload.campaignName ?? 'a'} campaign`
    case 'campaign.removed':
      return `You were removed from ${n.payload.campaignName ?? 'a campaign'}`
    case 'character.created':
      return `Character "${n.payload.characterName ?? ''}" was created`
    case 'admin.actionRequired':
      return (n.payload.message as string) ?? 'Action required'
    case 'system.info':
      return (n.payload.message as string) ?? 'System notification'
    case 'system.warning':
      return (n.payload.message as string) ?? 'System warning'
    default:
      return n.type
  }
}
