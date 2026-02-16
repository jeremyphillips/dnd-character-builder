import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { approveCampaignMember, rejectCampaignMember, updateCharacterStatus } from '../controllers/campaignMember.controller'

const router = Router()

router.use(requireAuth)

router.post('/:id/approve', approveCampaignMember)
router.post('/:id/reject', rejectCampaignMember)
router.patch('/:id/character-status', updateCharacterStatus)

export default router
