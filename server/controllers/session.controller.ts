import type { Request, Response } from 'express'
import * as sessionService from '../services/session.service'

export async function getSessions(req: Request, res: Response) {
  try {
    const sessions = await sessionService.getSessionsForUser(req.userId!, req.userRole!)
    // Normalize _id → id for frontend compatibility
    const normalized = sessions.map((s) => ({
      id: s._id.toString(),
      campaignId: s.campaignId?.toString(),
      date: s.date,
      title: s.title,
      notes: s.notes,
      status: s.status,
    }))
    res.json({ sessions: normalized })
  } catch (err) {
    console.error('Failed to get sessions:', err)
    res.status(500).json({ error: 'Failed to load sessions' })
  }
}

export async function getSession(req: Request, res: Response) {
  try {
    const doc = await sessionService.getSessionById(req.params.id)
    if (!doc) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    const session = {
      id: doc._id.toString(),
      campaignId: doc.campaignId?.toString(),
      date: doc.date,
      title: doc.title,
      notes: doc.notes,
      status: doc.status,
    }
    res.json({ session })
  } catch (err) {
    console.error('Failed to get session:', err)
    res.status(500).json({ error: 'Failed to load session' })
  }
}

export async function createSession(req: Request, res: Response) {
  const { campaignId, date, title, notes, visibility } = req.body

  if (!campaignId) {
    res.status(400).json({ error: 'campaignId is required' })
    return
  }
  if (!date) {
    res.status(400).json({ error: 'date is required' })
    return
  }

  try {
    const doc = await sessionService.createSession(req.userId!, {
      campaignId,
      date,
      title,
      notes,
      visibility,
    })

    const session = doc
      ? {
          id: doc._id.toString(),
          campaignId: doc.campaignId?.toString(),
          date: doc.date,
          title: doc.title,
          notes: doc.notes,
          status: doc.status,
        }
      : null

    res.status(201).json({ session })
  } catch (err) {
    console.error('Failed to create session:', err)
    res.status(500).json({ error: 'Failed to create session' })
  }
}

export async function updateSession(req: Request, res: Response) {
  const { title, notes, date, status } = req.body

  try {
    const doc = await sessionService.updateSession(req.params.id, { title, notes, date, status })
    if (!doc) {
      res.status(404).json({ error: 'Session not found' })
      return
    }
    const session = {
      id: doc._id.toString(),
      campaignId: doc.campaignId?.toString(),
      date: doc.date,
      title: doc.title,
      notes: doc.notes,
      status: doc.status,
    }
    res.json({ session })
  } catch (err) {
    console.error('Failed to update session:', err)
    res.status(500).json({ error: 'Failed to update session' })
  }
}

export async function deleteSession(req: Request, res: Response) {
  try {
    await sessionService.deleteSession(req.params.id)
    res.json({ message: 'Session deleted' })
  } catch (err) {
    console.error('Failed to delete session:', err)
    res.status(500).json({ error: 'Failed to delete session' })
  }
}
