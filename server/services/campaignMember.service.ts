import mongoose from 'mongoose'
import { env } from '../config/env'
import type { CampaignMemberStatus, CampaignMemberRole, CampaignCharacterStatus } from '../../shared/types'
const db = () => mongoose.connection.useDb(env.DB_NAME)
const campaignMembersCollection = () => db().collection('campaignMembers')

export interface CampaignMemberDoc {
  _id: mongoose.Types.ObjectId
  campaignId: mongoose.Types.ObjectId
  characterId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  role: CampaignMemberRole
  status: CampaignMemberStatus
  /** Character's in-campaign status (active by default, can be set to inactive/deceased) */
  characterStatus?: CampaignCharacterStatus
  requestedAt: Date
  approvedAt?: Date
  approvedBy?: mongoose.Types.ObjectId
  joinedAt?: Date
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getCampaignMembersByCampaign(campaignId: string) {
  return campaignMembersCollection()
    .find({ campaignId: new mongoose.Types.ObjectId(campaignId) })
    .sort({ joinedAt: 1 })
    .toArray()
}

export async function getCampaignMemberByCharacter(characterId: string) {
  return campaignMembersCollection().findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
  })
}

export async function getCampaignMembersByCharacter(characterId: string) {
  return campaignMembersCollection()
    .find({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: { $in: ['pending', 'approved'] },
    })
    .toArray()
}

export async function isCharacterInCampaign(characterId: string): Promise<boolean> {
  const existing = await campaignMembersCollection().findOne({
    characterId: new mongoose.Types.ObjectId(characterId),
    status: { $in: ['pending', 'approved'] },
  })
  return !!existing
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

export async function createCampaignMember(data: {
  campaignId: string
  characterId: string
  userId: string
  role: CampaignMemberRole
  status?: CampaignMemberStatus
}) {
  const now = new Date()
  const status = data.status ?? 'approved'
  const doc: Record<string, unknown> = {
    campaignId: new mongoose.Types.ObjectId(data.campaignId),
    characterId: new mongoose.Types.ObjectId(data.characterId),
    userId: new mongoose.Types.ObjectId(data.userId),
    role: data.role,
    status,
    requestedAt: now,
  }
  if (status === 'approved') {
    doc.approvedAt = now
    doc.joinedAt = now
  }
  const result = await campaignMembersCollection().insertOne(doc)
  return campaignMembersCollection().findOne({ _id: result.insertedId })
}

export async function getCampaignMemberById(id: string) {
  return campaignMembersCollection().findOne({
    _id: new mongoose.Types.ObjectId(id),
  })
}

export async function approveCampaignMember(
  id: string,
  approvedByUserId: string
) {
  const now = new Date()
  const updated = await campaignMembersCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id), status: 'pending' },
    {
      $set: {
        status: 'approved',
        approvedAt: now,
        approvedBy: new mongoose.Types.ObjectId(approvedByUserId),
        joinedAt: now,
      },
    },
    { returnDocument: 'after' },
  )
  return updated
}

export async function rejectCampaignMember(id: string) {
  const updated = await campaignMembersCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id), status: 'pending' },
    { $set: { status: 'rejected' } },
    { returnDocument: 'after' },
  )
  return updated
}

export async function updateCharacterStatus(
  id: string,
  characterStatus: CampaignCharacterStatus,
) {
  return campaignMembersCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { characterStatus } },
    { returnDocument: 'after' },
  )
}

export async function deleteCampaignMember(campaignId: string, characterId: string) {
  return campaignMembersCollection().deleteOne({
    campaignId: new mongoose.Types.ObjectId(campaignId),
    characterId: new mongoose.Types.ObjectId(characterId),
  })
}
