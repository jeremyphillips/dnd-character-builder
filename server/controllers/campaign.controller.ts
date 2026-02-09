import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as campaignService from '../services/campaign.service'

export async function getCampaigns(req: Request, res: Response) {
  const campaigns = await campaignService.getCampaignsForUser(req.userId!, req.userRole!)
  res.json({ campaigns })
}

export async function getCampaign(req: Request, res: Response) {
  const campaign = await campaignService.getCampaignById(req.params.id)

  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' })
    return
  }

  // verify the user is the admin or a member
  const uid = new mongoose.Types.ObjectId(req.userId!)
  const isAdmin = campaign.adminId.equals(uid)
  const isMember = (campaign.members as mongoose.Types.ObjectId[]).some((m) => m.equals(uid))

  if (!isAdmin && !isMember) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  res.json({ campaign })
}

export async function createCampaign(req: Request, res: Response) {
  const { name, setting, edition, description } = req.body

  if (!name) {
    res.status(400).json({ error: 'Campaign name is required' })
    return
  }

  if (!setting) {
    res.status(400).json({ error: 'Setting is required' })
    return
  }

  if (!edition) {
    res.status(400).json({ error: 'Edition is required' })
    return
  }

  const campaign = await campaignService.createCampaign(req.userId!, { name, setting, edition, description })
  res.status(201).json({ campaign })
}

export async function updateCampaign(req: Request, res: Response) {
  const campaign = await campaignService.getCampaignById(req.params.id)

  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' })
    return
  }

  if (!campaign.adminId.equals(new mongoose.Types.ObjectId(req.userId!))) {
    res.status(403).json({ error: 'Only the campaign admin can update this campaign' })
    return
  }

  const { name, setting, edition, description } = req.body
  const updated = await campaignService.updateCampaign(req.params.id, { name, setting, edition, description })
  res.json({ campaign: updated })
}

export async function deleteCampaign(req: Request, res: Response) {
  const campaign = await campaignService.getCampaignById(req.params.id)

  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' })
    return
  }

  if (!campaign.adminId.equals(new mongoose.Types.ObjectId(req.userId!))) {
    res.status(403).json({ error: 'Only the campaign admin can delete this campaign' })
    return
  }

  await campaignService.deleteCampaign(req.params.id)
  res.json({ message: 'Campaign deleted' })
}

// --- Helpers ---

export async function requireCampaignAdmin(req: Request, res: Response) {
  const campaign = await campaignService.getCampaignById(req.params.id)

  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' })
    return null
  }

  if (!campaign.adminId.equals(new mongoose.Types.ObjectId(req.userId!))) {
    res.status(403).json({ error: 'Only the campaign admin can perform this action' })
    return null
  }

  return campaign
}

export async function requireCampaignMember(req: Request, res: Response) {
  const campaign = await campaignService.getCampaignById(req.params.id)

  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found' })
    return null
  }

  const uid = new mongoose.Types.ObjectId(req.userId!)
  const isAdmin = campaign.adminId.equals(uid)
  const isMember = (campaign.members as mongoose.Types.ObjectId[]).some((m) => m.equals(uid))

  if (!isAdmin && !isMember) {
    res.status(403).json({ error: 'Forbidden' })
    return null
  }

  return campaign
}

// --- Members ---

export async function getMembers(req: Request, res: Response) {
  const campaign = await requireCampaignAdmin(req, res)
  if (!campaign) return

  const members = await campaignService.getMembers(req.params.id)
  res.json({ members })
}

export async function addMember(req: Request, res: Response) {
  const campaign = await requireCampaignAdmin(req, res)
  if (!campaign) return

  const { email } = req.body

  if (!email) {
    res.status(400).json({ error: 'email is required' })
    return
  }

  // Look up user by email
  const db = mongoose.connection.useDb(process.env.DB_NAME ?? 'dnd')
  const user = await db.collection('users').findOne({ email })

  if (!user) {
    // User doesn't exist yet — send an invite email
    const { sendCampaignInvite } = await import('../services/email.service')
    const adminUser = await db.collection('users').findOne(
      { _id: campaign.adminId },
      { projection: { username: 1 } },
    )
    await sendCampaignInvite({
      to: email,
      campaignName: campaign.name as string,
      invitedBy: (adminUser?.username as string) ?? 'A dungeon master',
    })
    res.status(200).json({ message: `Invite sent to ${email}` })
    return
  }

  const updated = await campaignService.addMember(req.params.id, user._id.toString())
  res.status(201).json({ campaign: updated })
}

export async function updateMember(req: Request, res: Response) {
  const campaign = await requireCampaignAdmin(req, res)
  if (!campaign) return

  const { role } = req.body
  await campaignService.updateMemberRole(req.params.id, req.params.userId, role)
  res.json({ message: 'Member updated' })
}

export async function removeMember(req: Request, res: Response) {
  const campaign = await requireCampaignAdmin(req, res)
  if (!campaign) return

  const updated = await campaignService.removeMember(req.params.id, req.params.userId)
  res.json({ campaign: updated })
}
