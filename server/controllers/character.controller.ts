import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as characterService from '../services/character.service'

export async function getCharacters(req: Request, res: Response) {
  const characters = await characterService.getCharactersByUser(req.userId!)
  res.json({ characters })
}

export async function getCharactersAvailableForCampaign(req: Request, res: Response) {
  try {
    const characters = await characterService.getCharactersAvailableForCampaign(req.userId!)
    res.json({ characters })
  } catch (err) {
    console.error('Failed to get available characters:', err)
    res.status(500).json({ error: 'Failed to load characters' })
  }
}

export async function getCharacter(req: Request, res: Response) {
  const character = await characterService.getCharacterById(req.params.id)

  if (!character) {
    res.status(404).json({ error: 'Character not found' })
    return
  }

  // Owner or admin/superadmin can view
  const isOwner = character.userId.equals(new mongoose.Types.ObjectId(req.userId!))
  const isAdmin = req.userRole === 'admin' || req.userRole === 'superadmin'

  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  // Also fetch campaigns this character's user belongs to
  const campaigns = await characterService.getCampaignsForCharacter(req.params.id)

  // Pending memberships this user can approve/reject (when they are campaign admin)
  const pendingMemberships = await characterService.getPendingMembershipsForAdmin(req.params.id, req.userId!)

  res.json({ character, campaigns, isOwner, isAdmin, pendingMemberships })
}

export async function createCharacter(req: Request, res: Response) {
  const { name } = req.body

  if (!name) {
    res.status(400).json({ error: 'Character name is required' })
    return
  }

  try {
    const character = await characterService.createCharacter(req.userId!, req.body)
    res.status(201).json({ character })
  } catch (err) {
    console.error('Failed to create character:', err)
    res.status(500).json({ error: 'Failed to create character' })
  }
}

export async function updateCharacter(req: Request, res: Response) {
  const character = await characterService.getCharacterById(req.params.id)

  if (!character) {
    res.status(404).json({ error: 'Character not found' })
    return
  }

  const isOwner = character.userId.equals(new mongoose.Types.ObjectId(req.userId!))
  const isAdmin = req.userRole === 'admin' || req.userRole === 'superadmin'

  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  // Non-admins can only update name, imageUrl, and narrative
  let updateData = req.body
  if (!isAdmin) {
    const { name, imageUrl, narrative } = req.body
    updateData = {} as any
    if (name !== undefined) updateData.name = name
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (narrative !== undefined) updateData.narrative = narrative
  }

  try {
    const updated = await characterService.updateCharacter(req.params.id, updateData)
    res.json({ character: updated })
  } catch (err) {
    console.error('Failed to update character:', err)
    res.status(500).json({ error: 'Failed to update character' })
  }
}

export async function deleteCharacter(req: Request, res: Response) {
  const character = await characterService.getCharacterById(req.params.id)

  if (!character) {
    res.status(404).json({ error: 'Character not found' })
    return
  }

  const isOwner = character.userId.equals(new mongoose.Types.ObjectId(req.userId!))
  const isAdmin = req.userRole === 'admin' || req.userRole === 'superadmin'

  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  await characterService.deleteCharacter(req.params.id)
  res.json({ message: 'Character deleted' })
}
