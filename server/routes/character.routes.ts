import { Router } from 'express'
import { requireAuth } from '../middleware/requireAuth'
import {
  getCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
} from '../controllers/character.controller'

const router = Router()

router.use(requireAuth)

router.get('/', getCharacters)
router.post('/', createCharacter)

router.get('/:id', getCharacter)
router.patch('/:id', updateCharacter)
router.delete('/:id', deleteCharacter)

export default router
