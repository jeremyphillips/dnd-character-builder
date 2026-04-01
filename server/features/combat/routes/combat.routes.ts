import { Router } from 'express'
import { asyncHandler } from '../../../shared/middleware/asyncHandler'
import {
  applyCombatIntentRequest,
  parseApplyIntentBody,
} from '../services/combatApplyIntent.service'
import {
  parseCombatStartupBody,
  startCombatSession,
} from '../services/combatSessions.service'

const router = Router()

router.post(
  '/sessions/apply-intent',
  asyncHandler(async (req, res) => {
    const parsed = parseApplyIntentBody(req.body)
    if (!parsed.ok) {
      res.status(400).json({ ok: false, error: parsed.error })
      return
    }
    const result = applyCombatIntentRequest(parsed.state, parsed.intent, parsed.context)
    res.status(200).json({ result })
  }),
)

router.post(
  '/sessions',
  asyncHandler(async (req, res) => {
    const parsed = parseCombatStartupBody(req.body)
    if (!parsed.ok) {
      res.status(400).json({ ok: false, error: parsed.error })
      return
    }
    const result = startCombatSession(parsed.input)
    if (!result.ok) {
      res.status(400).json(result)
      return
    }
    res.status(200).json({ ok: true, state: result.state })
  }),
)

export default router
