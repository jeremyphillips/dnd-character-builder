import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { requireRole } from '../middleware/requireRole'
import { uploadImage } from '../controllers/upload.controller'

const router = Router()

router.use(requireAuth)
router.post('/', requireRole('admin', 'superadmin'), uploadImage)

export default router
