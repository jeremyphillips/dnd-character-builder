import mongoose from 'mongoose'
import { env } from '../config/env'
import * as notificationService from './notification.service'

const db = () => mongoose.connection.useDb(env.DB_NAME)
const sessionsCollection = () => db().collection('sessions')
const campaignsCollection = () => db().collection('campaigns')

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SessionStatus = 'scheduled' | 'completed' | 'cancelled'

export interface SessionDoc {
  campaignId: mongoose.Types.ObjectId
  date: string // ISO
  title?: string
  notes?: string
  status: SessionStatus
  visibility: {
    allCharacters: boolean
    characterIds: string[]
  }
  createdAt: Date
  updatedAt: Date
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getSessionsForUser(userId: string, role: string) {
  const oid = new mongoose.Types.ObjectId(userId)

  // Find campaigns the user belongs to
  const campaigns = await campaignsCollection()
    .find({
      $or: [
        { 'membership.adminId': oid },
        { 'membership.members.userId': oid },
      ],
    })
    .project({ _id: 1 })
    .toArray()

  const campaignIds = campaigns.map((c) => c._id)

  if (role === 'admin' || role === 'superadmin') {
    return sessionsCollection().find().sort({ date: -1 }).toArray()
  }

  return sessionsCollection()
    .find({ campaignId: { $in: campaignIds } })
    .sort({ date: -1 })
    .toArray()
}

export async function getSessionById(id: string) {
  return sessionsCollection().findOne({
    _id: new mongoose.Types.ObjectId(id),
  })
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

export async function createSession(
  adminUserId: string,
  data: {
    campaignId: string
    date: string
    title?: string
    notes?: string
    visibility?: { allCharacters: boolean; characterIds: string[] }
  },
) {
  const now = new Date()

  const doc: SessionDoc = {
    campaignId: new mongoose.Types.ObjectId(data.campaignId),
    date: data.date,
    title: data.title,
    notes: data.notes,
    status: 'scheduled',
    visibility: data.visibility ?? { allCharacters: true, characterIds: [] },
    createdAt: now,
    updatedAt: now,
  }

  const result = await sessionsCollection().insertOne(doc)
  const session = await sessionsCollection().findOne({ _id: result.insertedId })

  // Notify all campaign members (excluding the admin who created it)
  const campaign = await campaignsCollection().findOne({
    _id: new mongoose.Types.ObjectId(data.campaignId),
  })

  if (campaign?.membership?.members?.length) {
    const memberUserIds = (campaign.membership.members as { userId: mongoose.Types.ObjectId }[])
      .map((m) => m.userId.toString())
      .filter((uid) => uid !== adminUserId)

    await notificationService.createSessionInviteNotifications({
      sessionId: result.insertedId.toString(),
      campaignId: data.campaignId,
      memberUserIds,
      sessionTitle: data.title ?? 'New Session',
      sessionDate: data.date,
      sessionNotes: data.notes,
    })
  }

  return session
}

export async function updateSession(
  id: string,
  data: Partial<Pick<SessionDoc, 'title' | 'notes' | 'date' | 'status'>>,
) {
  return sessionsCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
}

export async function deleteSession(id: string) {
  return sessionsCollection().deleteOne({ _id: new mongoose.Types.ObjectId(id) })
}
