import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import { requireRole } from '../middleware/requireRole'
import { requireCampaignRole } from '../middleware/requireCampaignRole'
import {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getPartyCharacters,
  getMembers,
  getMembersForMessaging,
  preCheckMember,
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

// All campaign routes require authentication
router.use(requireAuth)

// Campaign list & create
router.get('/', getCampaigns)
router.post('/', requireRole('admin', 'superadmin'), createCampaign)

// Campaign detail — any member can view
router.get('/:id', requireCampaignRole('observer'), getCampaign)

// Campaign update/delete — owner only
router.patch('/:id', requireCampaignRole('admin'), updateCampaign)
router.delete('/:id', requireCampaignRole('admin'), deleteCampaign)

// Party characters — any member can view
router.get('/:id/party', requireCampaignRole('observer'), getPartyCharacters)

// Members — admin/dm can view, admin can manage
router.get('/:id/members', requireCampaignRole('dm'), getMembers)
router.get('/:id/members-for-messaging', requireCampaignRole('observer'), getMembersForMessaging)
router.post('/:id/members/pre-check', requireCampaignRole('admin'), preCheckMember)
router.post('/:id/members', requireCampaignRole('admin'), addMember)
router.patch('/:id/members/:userId', requireCampaignRole('admin'), updateMember)
router.delete('/:id/members/:userId', requireCampaignRole('admin'), removeMember)

// Notes — any member can read, admin can write
router.get('/:id/notes', requireCampaignRole('observer'), getNotes)
router.post('/:id/notes', requireCampaignRole('admin'), createNote)
router.patch('/:id/notes/:noteId', requireCampaignRole('admin'), updateNote)
router.delete('/:id/notes/:noteId', requireCampaignRole('admin'), deleteNote)

export default router
