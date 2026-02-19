import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { login, logout, register, resolveInvite, acceptInvite, getMe, updateMe, getSocketToken } from '../controllers/auth.controller'

const router = Router()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/resolve-invite', resolveInvite)
router.post('/accept-invite', requireAuth, acceptInvite)
router.get('/me', getMe)
router.patch('/me', requireAuth, updateMe)
router.get('/socket-token', requireAuth, getSocketToken)

export default router
