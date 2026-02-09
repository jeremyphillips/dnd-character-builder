import type { Request, Response } from 'express'
import mongoose from 'mongoose'
import * as characterService from '../services/character.service'

export async function getCharacters(req: Request, res: Response) {
  const characters = await characterService.getCharactersByUser(req.userId!)
  res.json({ characters })
}

export async function getCharacter(req: Request, res: Response) {
  const character = await characterService.getCharacterById(req.params.id)

  if (!character) {
    res.status(404).json({ error: 'Character not found' })
    return
  }

  if (!character.userId.equals(new mongoose.Types.ObjectId(req.userId!))) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  res.json({ character })
}

export async function createCharacter(req: Request, res: Response) {
  const { name } = req.body

  if (!name) {
    res.status(400).json({ error: 'Character name is required' })
    return
  }

  const character = await characterService.createCharacter(req.userId!, req.body)
  res.status(201).json({ character })
}

export async function updateCharacter(req: Request, res: Response) {
  const character = await characterService.getCharacterById(req.params.id)

  if (!character) {
    res.status(404).json({ error: 'Character not found' })
    return
  }

  if (!character.userId.equals(new mongoose.Types.ObjectId(req.userId!))) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  const updated = await characterService.updateCharacter(req.params.id, req.body)
  res.json({ character: updated })
}

export async function deleteCharacter(req: Request, res: Response) {
  const character = await characterService.getCharacterById(req.params.id)

  if (!character) {
    res.status(404).json({ error: 'Character not found' })
    return
  }

  if (!character.userId.equals(new mongoose.Types.ObjectId(req.userId!))) {
    res.status(403).json({ error: 'Forbidden' })
    return
  }

  await characterService.deleteCharacter(req.params.id)
  res.json({ message: 'Character deleted' })
}
