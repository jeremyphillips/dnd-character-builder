import mongoose from 'mongoose'
import { env } from '../config/env'

const campaignsCollection = () => mongoose.connection.useDb(env.DB_NAME).collection('campaigns')

export async function getCampaignsForUser(userId: string, role: string) {
  const oid = new mongoose.Types.ObjectId(userId)

  if (role === 'admin' || role === 'superadmin') {
    // admins see campaigns they own or are invited to
    return campaignsCollection()
      .find({ $or: [{ adminId: oid }, { members: oid }] })
      .toArray()
  }

  // regular users see only campaigns they're invited to
  return campaignsCollection()
    .find({ members: oid })
    .toArray()
}

export async function getCampaignById(id: string) {
  return campaignsCollection().findOne({
    _id: new mongoose.Types.ObjectId(id),
  })
}

export async function createCampaign(
  adminId: string,
  data: { name: string; setting: string; edition: string; description?: string }
) {
  const now = new Date()
  const result = await campaignsCollection().insertOne({
    name: data.name,
    setting: data.setting,
    edition: data.edition,
    description: data.description ?? '',
    party: [],
    adminId: new mongoose.Types.ObjectId(adminId),
    members: [],
    createdAt: now,
    updatedAt: now,
  })

  return campaignsCollection().findOne({ _id: result.insertedId })
}

export async function updateCampaign(id: string, data: { name?: string; setting?: string; edition?: string; description?: string }) {
  return campaignsCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
}

export async function deleteCampaign(id: string) {
  return campaignsCollection().deleteOne({ _id: new mongoose.Types.ObjectId(id) })
}

export async function getMembers(campaignId: string) {
  const usersCollection = () => mongoose.connection.useDb(env.DB_NAME).collection('users')
  const campaign = await getCampaignById(campaignId)
  if (!campaign || !campaign.members?.length) return []

  return usersCollection()
    .find(
      { _id: { $in: campaign.members } },
      { projection: { passwordHash: 0 } },
    )
    .toArray()
}

export async function addMember(campaignId: string, userId: string) {
  const uid = new mongoose.Types.ObjectId(userId)
  return campaignsCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(campaignId) },
    { $addToSet: { members: uid }, $set: { updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
}

export async function updateMemberRole(_campaignId: string, _userId: string, _role: string) {
  // TODO: If campaigns need per-member roles, add a memberRoles map to the schema.
  // For now this is a placeholder.
}

export async function removeMember(campaignId: string, userId: string) {
  const uid = new mongoose.Types.ObjectId(userId)
  return campaignsCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(campaignId) },
    { $pull: { members: uid }, $set: { updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
}
