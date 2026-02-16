import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { login, logout, getMe, updateMe, getSocketToken } from '../controllers/auth.controller'

const router = Router()

router.post('/login', login)
router.post('/logout', logout)
router.get('/me', getMe)
router.patch('/me', requireAuth, updateMe)
router.get('/socket-token', requireAuth, getSocketToken)

export default router
