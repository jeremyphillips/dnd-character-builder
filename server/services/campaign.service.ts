import mongoose from 'mongoose'
import { env } from '../config/env'

const db = () => mongoose.connection.useDb(env.DB_NAME)
const campaignsCollection = () => db().collection('campaigns')
const campaignMembersCollection = () => db().collection('campaignMembers')

// ---------------------------------------------------------------------------
// Campaign CRUD
// ---------------------------------------------------------------------------

export async function getCampaignsForUser(userId: string, role: string) {
  const oid = new mongoose.Types.ObjectId(userId)

  // Get campaign IDs from CampaignMembers where user is a member
  const memberCampaignIds = await campaignMembersCollection()
    .distinct('campaignId', { userId: oid })

  return campaignsCollection()
    .find({
      $or: [
        { adminId: oid },
        { _id: { $in: memberCampaignIds } },
      ],
    })
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

export async function updateCampaign(
  id: string,
  data: { name?: string; setting?: string; edition?: string; description?: string }
) {
  return campaignsCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
}

export async function deleteCampaign(id: string) {
  return campaignsCollection().deleteOne({ _id: new mongoose.Types.ObjectId(id) })
}

// ---------------------------------------------------------------------------
// Members — subdocument { userId, role, joinedAt }
// ---------------------------------------------------------------------------

export async function getMembers(campaignId: string) {
  const usersCollection = () => db().collection('users')
  const members = await campaignMembersCollection()
    .find({ campaignId: new mongoose.Types.ObjectId(campaignId) })
    .toArray()

  if (members.length === 0) return []

  const memberUserIds = (members as unknown as { userId: mongoose.Types.ObjectId }[]).map((m) => m.userId)
  const uniqueUserIds = [...new Map(memberUserIds.map((id) => [id.toString(), id])).values()]

  const users = await usersCollection()
    .find(
      { _id: { $in: uniqueUserIds } },
      { projection: { passwordHash: 0 } },
    )
    .toArray()

  return users.map((u) => {
    const membership = (members as unknown as { userId: mongoose.Types.ObjectId; role: string; joinedAt: Date }[]).find(
      (m) => m.userId.equals(u._id),
    )
    return {
      ...u,
      campaignRole: membership?.role ?? 'player',
      joinedAt: membership?.joinedAt ?? null,
    }
  })
}

export async function getMembersForMessaging(campaignId: string) {
  const campaign = await getCampaignById(campaignId)
  if (!campaign) return []

  const usersCollection = () => db().collection('users')
  const adminId = (campaign as { adminId: mongoose.Types.ObjectId }).adminId

  const approvedMembers = await campaignMembersCollection()
    .find({
      campaignId: new mongoose.Types.ObjectId(campaignId),
      $or: [{ status: 'approved' }, { status: { $exists: false } }],
    })
    .toArray()

  const memberUserIds = new Set<string>()
  memberUserIds.add(adminId.toString())
  ;(approvedMembers as { userId: mongoose.Types.ObjectId }[]).forEach((m) =>
    memberUserIds.add(m.userId.toString())
  )

  const users = await usersCollection()
    .find(
      { _id: { $in: [...memberUserIds].map((id) => new mongoose.Types.ObjectId(id)) } },
      { projection: { _id: 1, username: 1 } },
    )
    .toArray()

  return users.map((u) => ({
    _id: (u._id as mongoose.Types.ObjectId).toString(),
    username: u.username as string,
  }))
}

export async function getPartyCharacters(campaignId: string) {
  const usersCol = () => db().collection('users')
  const charsCol = () => db().collection('characters')

  const campaign = await getCampaignById(campaignId)
  if (!campaign) return []

  // Get CampaignMembers for this campaign (pending + approved; excluded rejected; legacy docs without status count as approved)
  const members = await campaignMembersCollection()
    .find({
      campaignId: new mongoose.Types.ObjectId(campaignId),
      $or: [
        { status: 'pending' },
        { status: 'approved' },
        { status: { $exists: false } },
      ],
    })
    .sort({ joinedAt: 1, requestedAt: 1 })
    .toArray()

  const memberDocs = members as unknown as {
    _id: mongoose.Types.ObjectId
    characterId: mongoose.Types.ObjectId
    status?: string
    joinedAt?: Date
    requestedAt?: Date
  }[]

  const characterIds = memberDocs.map((m) => m.characterId)
  if (characterIds.length === 0) return []

  const characters = await charsCol()
    .find({ _id: { $in: characterIds } })
    .toArray()

  const memberByCharId = new Map(
    memberDocs.map((m) => [m.characterId.toString(), m])
  )

  const userIds = [...new Set(characters.map((c) => (c.userId as mongoose.Types.ObjectId).toString()))]
  const users = await usersCol()
    .find(
      { _id: { $in: userIds.map((id) => new mongoose.Types.ObjectId(id)) } },
      { projection: { username: 1 } },
    )
    .toArray()

  const userMap = new Map(users.map((u) => [u._id.toString(), u.username as string]))

  return characters.map((c) => {
    const m = memberByCharId.get(c._id.toString())
    const status = (m?.status ?? 'approved') as 'pending' | 'approved'
    return {
      ...c,
      ownerName: userMap.get((c.userId as mongoose.Types.ObjectId).toString()) ?? 'Unknown',
      status,
      campaignMemberId: m?._id?.toString(),
    }
  })
}

/** @deprecated Use CampaignMember creation via invite accept instead. Kept for backward compatibility. */
export async function addMember(
  _campaignId: string,
  _userId: string,
  _role: 'dm' | 'player' | 'observer' = 'player'
) {
  return null
}

export async function updateMemberRole(
  campaignId: string,
  userId: string,
  role: 'dm' | 'player' | 'observer'
) {
  const uid = new mongoose.Types.ObjectId(userId)
  await campaignMembersCollection().updateMany(
    {
      campaignId: new mongoose.Types.ObjectId(campaignId),
      userId: uid,
    },
    { $set: { role } },
  )
  return getCampaignById(campaignId)
}

export async function removeMember(campaignId: string, userId: string) {
  const uid = new mongoose.Types.ObjectId(userId)
  await campaignMembersCollection().deleteMany({
    campaignId: new mongoose.Types.ObjectId(campaignId),
    userId: uid,
  })
  return getCampaignById(campaignId)
}
