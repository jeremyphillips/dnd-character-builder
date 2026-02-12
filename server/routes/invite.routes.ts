import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { getInvite, respondToInvite, getMyInvites } from '../controllers/invite.controller'

const router = Router()

router.use(requireAuth)

router.get('/', getMyInvites)
router.get('/:inviteId', getInvite)
router.post('/:inviteId/respond', respondToInvite)

export default router
