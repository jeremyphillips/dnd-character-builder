import type { Request, Response, NextFunction } from 'express'
import mongoose from 'mongoose'
import { env } from '../config/env'
import { getCampaignById } from '../services/campaign.service'
import type { CampaignRole } from '../../shared/types'

const db = () => mongoose.connection.useDb(env.DB_NAME)
const campaignMembersCollection = () => db().collection('campaignMembers')

/**
 * Campaign-scoped authorization middleware.
 *
 * Fetches the campaign from `req.params.id`, determines the user's
 * campaign-level role, and checks it against the required roles.
 *
 * The campaign admin (owner) always has implicit 'admin' role.
 * Regular members have whatever role was assigned in CampaignMembers.
 *
 * Attaches `req.campaign` and `req.campaignRole` for downstream use.
 *
 * Usage:
 *   requireCampaignRole('admin')          — only the campaign owner
 *   requireCampaignRole('admin', 'dm')    — owner or DMs
 *   requireCampaignRole('pc')             — any member (admin/dm/pc implicitly pass)
 *   requireCampaignRole('observer')       — anyone with access (all roles pass)
 */
export function requireCampaignRole(...requiredRoles: Array<CampaignRole | 'admin'>) {
  const hierarchy: Array<CampaignRole | 'admin'> = ['observer', 'pc', 'dm', 'admin']
  const minLevel = Math.min(...requiredRoles.map((r) => hierarchy.indexOf(r)))

  return async (req: Request, res: Response, next: NextFunction) => {
    const campaignId = req.params.id

    if (!campaignId) {
      res.status(400).json({ error: 'Campaign ID is required' })
      return
    }

    const campaign = await getCampaignById(campaignId)

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' })
      return
    }

    const uid = new mongoose.Types.ObjectId(req.userId!)
    const isOwner = campaign.membership.adminId.equals(uid)

    let campaignRole: CampaignRole | 'admin' | null = null

    if (isOwner) {
      campaignRole = 'admin'
    } else {
      const members = await campaignMembersCollection()
        .find({
          campaignId: new mongoose.Types.ObjectId(campaignId),
          userId: uid,
        })
        .toArray()

      const memberDocs = members as { role: string; status?: string }[]
      const approvedMembers = memberDocs.filter((m) => (m.status ?? 'approved') === 'approved')
      const hasAnyMember = memberDocs.length > 0

      if (hasAnyMember) {
        // Pending-only: observer only (can view, cannot join sessions, add notes)
        if (approvedMembers.length === 0) {
          campaignRole = 'observer'
        } else {
          // Use highest role among approved members
          const hasDm = approvedMembers.some((m) => m.role === 'dm')
          campaignRole = hasDm ? 'dm' : 'pc'
        }
      }
    }

    if (!campaignRole) {
      res.status(403).json({ error: 'You are not a member of this campaign' })
      return
    }

    const userLevel = hierarchy.indexOf(campaignRole)
    if (userLevel < minLevel) {
      res.status(403).json({ error: 'Insufficient campaign permissions' })
      return
    }

    req.campaign = campaign
    req.campaignRole = campaignRole
    next()
  }
}
