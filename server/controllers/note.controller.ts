import type { Request, Response } from 'express'
import * as noteService from '../services/note.service'
import { requireCampaignAdmin, requireCampaignMember } from './campaign.controller'

export async function getNotes(req: Request, res: Response) {
  const campaign = await requireCampaignMember(req, res)
  if (!campaign) return

  const notes = await noteService.getNotesByCampaign(req.params.id)
  res.json({ notes })
}

export async function createNote(req: Request, res: Response) {
  const campaign = await requireCampaignAdmin(req, res)
  if (!campaign) return

  const { title, body } = req.body
  const note = await noteService.createNote(req.params.id, req.userId!, { title, body })
  res.status(201).json({ note })
}

export async function updateNote(req: Request, res: Response) {
  const campaign = await requireCampaignAdmin(req, res)
  if (!campaign) return

  const existing = await noteService.getNoteById(req.params.noteId)
  if (!existing) {
    res.status(404).json({ error: 'Note not found' })
    return
  }

  const { title, body } = req.body
  const note = await noteService.updateNote(req.params.noteId, { title, body })
  res.json({ note })
}

export async function deleteNote(req: Request, res: Response) {
  const campaign = await requireCampaignAdmin(req, res)
  if (!campaign) return

  const existing = await noteService.getNoteById(req.params.noteId)
  if (!existing) {
    res.status(404).json({ error: 'Note not found' })
    return
  }

  await noteService.deleteNote(req.params.noteId)
  res.json({ message: 'Note deleted' })
}
