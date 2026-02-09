import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { requireRole } from '../middleware/requireRole'
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getMembers,
  addMember,
  updateMember,
  removeMember,
} from '../controllers/campaign.controller'
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
} from '../controllers/note.controller'

const router = Router()

router.use(requireAuth)

router.get('/', getCampaigns)
router.post('/', requireRole('admin', 'superadmin'), createCampaign)

router.get('/:id', getCampaign)
router.patch('/:id', updateCampaign)
router.delete('/:id', deleteCampaign)

router.get('/:id/members', getMembers)
router.post('/:id/members', addMember)
router.patch('/:id/members/:userId', updateMember)
router.delete('/:id/members/:userId', removeMember)

router.get('/:id/notes', getNotes)
router.post('/:id/notes', createNote)
router.patch('/:id/notes/:noteId', updateNote)
router.delete('/:id/notes/:noteId', deleteNote)

export default router
