import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as campaignMemberService from '../services/campaignMember.service'
import { getCampaignById } from '../services/campaign.service'
import * as notificationService from '../services/notification.service'
import { env } from '../config/env'

const db = () => mongoose.connection.useDb(env.DB_NAME)

export async function approveCampaignMember(req: Request, res: Response) {
  const memberId = req.params.id
  const userId = req.userId!

  const member = await campaignMemberService.getCampaignMemberById(memberId)
  if (!member) {
    res.status(404).json({ error: 'Campaign member not found' })
    return
  }

  const m = member as { status?: string; campaignId: mongoose.Types.ObjectId }
  if (m.status !== 'pending') {
    res.status(400).json({ error: 'Campaign member is not pending approval' })
    return
  }

  const campaign = await getCampaignById(m.campaignId.toString())
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' })
    return
  }

  const isAdmin = campaign.membership.adminId.equals(new mongoose.Types.ObjectId(userId))
  if (!isAdmin) {
    res.status(403).json({ error: 'Only the campaign admin can approve characters' })
    return
  }

  const updated = await campaignMemberService.approveCampaignMember(memberId, userId)
  if (!updated) {
    res.status(400).json({ error: 'Failed to approve' })
    return
  }

  const u = updated as { userId: mongoose.Types.ObjectId; characterId: mongoose.Types.ObjectId }
  const character = await db().collection('characters').findOne({ _id: u.characterId })

  await notificationService.createNotification({
    userId: u.userId,
    type: 'character_approved',
    requiresAction: false,
    context: {
      campaignId: m.campaignId,
      characterId: u.characterId,
    },
    payload: {
      characterName: character?.name,
      campaignName: campaign.identity.name,
    },
  })

  const approvedMembers = await campaignMemberService.getCampaignMembersByCampaign(m.campaignId.toString())
  const partyMemberUserIds = (approvedMembers as { userId: mongoose.Types.ObjectId; status?: string }[])
    .filter((mbr) => (mbr.status ?? 'approved') === 'approved' && !mbr.userId.equals(u.userId))
    .map((mbr) => mbr.userId)

  for (const memberUserId of partyMemberUserIds) {
    await notificationService.createNotification({
      userId: memberUserId,
      type: 'newPartyMember',
      requiresAction: false,
      context: {
        characterId: u.characterId,
        campaignId: m.campaignId,
      },
      payload: {
        characterName: character?.name,
        campaignName: campaign.identity.name,
      },
    })
  }

  res.json({ campaignMember: updated })
}

export async function rejectCampaignMember(req: Request, res: Response) {
  const memberId = req.params.id
  const userId = req.userId!

  const member = await campaignMemberService.getCampaignMemberById(memberId)
  if (!member) {
    res.status(404).json({ error: 'Campaign member not found' })
    return
  }

  const m = member as { status?: string; campaignId: mongoose.Types.ObjectId }
  if (m.status !== 'pending') {
    res.status(400).json({ error: 'Campaign member is not pending approval' })
    return
  }

  const campaign = await getCampaignById(m.campaignId.toString())
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' })
    return
  }

  const isAdmin = campaign.membership.adminId.equals(new mongoose.Types.ObjectId(userId))
  if (!isAdmin) {
    res.status(403).json({ error: 'Only the campaign admin can reject characters' })
    return
  }

  const updated = await campaignMemberService.rejectCampaignMember(memberId)
  if (!updated) {
    res.status(400).json({ error: 'Failed to reject' })
    return
  }

  const u = updated as { userId: mongoose.Types.ObjectId; characterId: mongoose.Types.ObjectId }
  const character = await db().collection('characters').findOne({ _id: u.characterId })

  await notificationService.createNotification({
    userId: u.userId,
    type: 'character_rejected',
    requiresAction: false,
    context: {
      campaignId: m.campaignId,
      characterId: u.characterId,
    },
    payload: {
      characterName: character?.name,
      campaignName: campaign.identity.name,
    },
  })

  res.json({ campaignMember: updated })
}
