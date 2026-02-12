import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as campaignService from '../services/campaign.service'

// ---------------------------------------------------------------------------
// Campaign CRUD
// ---------------------------------------------------------------------------

export async function getCampaigns(req: Request, res: Response) {
  const campaigns = await campaignService.getCampaignsForUser(req.userId!, req.userRole!)
  res.json({ campaigns })
}

export async function getCampaign(req: Request, res: Response) {
  // req.campaign is attached by requireCampaignRole middleware
  res.json({ campaign: req.campaign })
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

  try {
    const campaign = await campaignService.createCampaign(req.userId!, { name, setting, edition, description })
    res.status(201).json({ campaign })
  } catch (err) {
    console.error('Failed to create campaign:', err)
    res.status(500).json({ error: 'Failed to create campaign' })
  }
}

export async function updateCampaign(req: Request, res: Response) {
  // req.campaign attached by requireCampaignRole('admin')
  const { name, setting, edition, description, allowLegacyEditionNpcs } = req.body
  const updated = await campaignService.updateCampaign(req.params.id, {
    name,
    setting,
    edition,
    description,
    allowLegacyEditionNpcs
  })
  res.json({ campaign: updated })
}

export async function deleteCampaign(req: Request, res: Response) {
  // req.campaign attached by requireCampaignRole('admin')
  await campaignService.deleteCampaign(req.params.id)
  res.json({ message: 'Campaign deleted' })
}

// ---------------------------------------------------------------------------
// Party (characters belonging to campaign members)
// ---------------------------------------------------------------------------

export async function getPartyCharacters(req: Request, res: Response) {
  try {
    const characters = await campaignService.getPartyCharacters(req.params.id)
    res.json({ characters })
  } catch (err) {
    console.error('Failed to get party characters:', err)
    res.status(500).json({ error: 'Failed to load party characters' })
  }
}

// ---------------------------------------------------------------------------
// Members
// ---------------------------------------------------------------------------

export async function getMembers(req: Request, res: Response) {
  const members = await campaignService.getMembers(req.params.id)
  res.json({ members })
}

export async function getMembersForMessaging(req: Request, res: Response) {
  const members = await campaignService.getMembersForMessaging(req.params.id)
  res.json({ members })
}

export async function addMember(req: Request, res: Response) {
  const campaign = req.campaign!
  const { email, role } = req.body

  if (!email) {
    res.status(400).json({ error: 'email is required' })
    return
  }

  const validRoles = ['dm', 'player', 'observer']
  const memberRole = validRoles.includes(role) ? role : 'player'

  // Look up user by email
  const db = mongoose.connection.useDb(process.env.DB_NAME ?? 'dnd')
  const user = await db.collection('users').findOne({ email })

  if (!user) {
    // User doesn't exist yet — send a placeholder invite email
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
    res.status(200).json({ message: `Invite email sent to ${email}` })
    return
  }

  // User exists — create a campaign invite (with notification)
  try {
    const { createInvite } = await import('../services/invite.service')
    const adminUser = await db.collection('users').findOne(
      { _id: campaign.adminId },
      { projection: { username: 1 } },
    )

    const invite = await createInvite({
      campaignId: req.params.id,
      invitedUserId: user._id.toString(),
      invitedByUserId: req.userId!,
      role: memberRole,
      campaignName: campaign.name as string,
      invitedByName: (adminUser?.username as string) ?? 'A dungeon master',
    })

    res.status(201).json({ invite, message: `Invite sent to ${email}` })
  } catch (err) {
    console.error('Failed to create invite:', err)
    res.status(500).json({ error: 'Failed to create invite' })
  }
}

export async function updateMember(req: Request, res: Response) {
  const { role } = req.body

  const validRoles = ['dm', 'player', 'observer']
  if (!role || !validRoles.includes(role)) {
    res.status(400).json({ error: `role must be one of: ${validRoles.join(', ')}` })
    return
  }

  const updated = await campaignService.updateMemberRole(req.params.id, req.params.userId, role)
  res.json({ campaign: updated })
}

export async function removeMember(req: Request, res: Response) {
  const updated = await campaignService.removeMember(req.params.id, req.params.userId)
  res.json({ campaign: updated })
}
