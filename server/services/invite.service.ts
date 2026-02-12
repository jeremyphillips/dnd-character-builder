import mongoose from 'mongoose'
import { env } from '../config/env'
import * as notificationService from './notification.service'

const db = () => mongoose.connection.useDb(env.DB_NAME)
const invitesCollection = () => db().collection('campaignInvites')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired'
export type InviteRole = 'player' | 'dm' | 'observer'

export interface CampaignInviteDoc {
  campaignId: mongoose.Types.ObjectId
  invitedUserId: mongoose.Types.ObjectId
  invitedByUserId: mongoose.Types.ObjectId
  role: InviteRole
  status: InviteStatus
  createdAt: Date
  respondedAt: Date | null
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getInviteById(id: string) {
  return invitesCollection().findOne({
    _id: new mongoose.Types.ObjectId(id),
  })
}

export async function getInvitesForUser(userId: string) {
  return invitesCollection()
    .find({ invitedUserId: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function getPendingInviteForCampaign(
  campaignId: string,
  invitedUserId: string,
) {
  return invitesCollection().findOne({
    campaignId: new mongoose.Types.ObjectId(campaignId),
    invitedUserId: new mongoose.Types.ObjectId(invitedUserId),
    status: 'pending',
  })
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

export async function createInvite(data: {
  campaignId: string
  invitedUserId: string
  invitedByUserId: string
  role: InviteRole
  campaignName: string
  invitedByName: string
}) {
  const existing = await getPendingInviteForCampaign(data.campaignId, data.invitedUserId)
  if (existing) return existing // Don't create duplicate pending invites

  const doc: CampaignInviteDoc = {
    campaignId: new mongoose.Types.ObjectId(data.campaignId),
    invitedUserId: new mongoose.Types.ObjectId(data.invitedUserId),
    invitedByUserId: new mongoose.Types.ObjectId(data.invitedByUserId),
    role: data.role,
    status: 'pending',
    createdAt: new Date(),
    respondedAt: null,
  }

  const result = await invitesCollection().insertOne(doc)
  const invite = await invitesCollection().findOne({ _id: result.insertedId })

  // Create notification for the invited user
  await notificationService.createNotification({
    userId: new mongoose.Types.ObjectId(data.invitedUserId),
    type: 'campaign.invite',
    requiresAction: true,
    context: {
      campaignId: new mongoose.Types.ObjectId(data.campaignId),
      inviteId: result.insertedId,
    },
    payload: {
      campaignName: data.campaignName,
      invitedByName: data.invitedByName,
      role: data.role,
    },
  })

  return invite
}

export async function respondToInvite(
  inviteId: string,
  userId: string,
  accept: boolean,
  characterId?: string,
) {
  const invite = await getInviteById(inviteId)
  if (!invite) return null
  if (invite.invitedUserId.toString() !== userId) return null
  if (invite.status !== 'pending') return invite // Already responded

  if (accept && !characterId) {
    throw new Error('characterId is required when accepting an invite')
  }

  const newStatus: InviteStatus = accept ? 'accepted' : 'declined'

  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    respondedAt: new Date(),
  }
  if (accept && characterId) {
    updatePayload.characterId = new mongoose.Types.ObjectId(characterId)
  }

  const updated = await invitesCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(inviteId) },
    { $set: updatePayload },
    { returnDocument: 'after' },
  )

  // If accepted, create CampaignMember with status pending (awaiting DM approval)
  if (accept && characterId) {
    const campaignMemberService = await import('./campaignMember.service')
    const role = invite.role === 'dm' ? 'dm' : 'player'
    const member = await campaignMemberService.createCampaignMember({
      campaignId: invite.campaignId.toString(),
      characterId,
      userId,
      role,
      status: 'pending',
    })

    // Notify campaign admin about character pending approval
    const campaign = await db().collection('campaigns').findOne({ _id: invite.campaignId })
    const character = await db().collection('characters').findOne({ _id: new mongoose.Types.ObjectId(characterId) })
    const invitedUser = await db().collection('users').findOne({ _id: invite.invitedUserId })
    const adminId = campaign?.adminId
    if (adminId && member && character && invitedUser) {
      await notificationService.createNotification({
        userId: adminId,
        type: 'character_pending_approval',
        requiresAction: true,
        context: {
          campaignId: invite.campaignId,
          campaignMemberId: member._id,
          characterId: member.characterId,
          invitedUserId: invite.invitedUserId,
        },
        payload: {
          characterName: character.name,
          userName: invitedUser.username,
          campaignName: campaign.name,
        },
      })
    }
  }

  // Mark the associated notification action as taken
  const notification = await db().collection('notifications').findOne({
    userId: invite.invitedUserId,
    type: 'campaign.invite',
    'context.inviteId': invite._id,
  })
  if (notification) {
    await notificationService.markActionTaken(notification._id.toString(), userId)
  }

  return updated
}
