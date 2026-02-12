import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { approveCampaignMember, rejectCampaignMember } from '../controllers/campaignMember.controller'

const router = Router()

router.use(requireAuth)

router.post('/:id/approve', approveCampaignMember)
router.post('/:id/reject', rejectCampaignMember)

export default router
