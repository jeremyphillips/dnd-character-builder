import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { requireRole } from '../middleware/requireRole'
import {
  getSessions,
  getSession,
  createSession,
  updateSession,
  deleteSession,
} from '../controllers/session.controller'

const router = Router()

router.use(requireAuth)

router.get('/', getSessions)
router.get('/:id', getSession)
router.post('/', requireRole('admin', 'superadmin'), createSession)
router.patch('/:id', requireRole('admin', 'superadmin'), updateSession)
router.delete('/:id', requireRole('admin', 'superadmin'), deleteSession)

export default router
