import mongoose from 'mongoose'
import { env } from '../config/env'

const db = () => mongoose.connection.useDb(env.DB_NAME)
const campaignsCollection = () => db().collection('campaigns')
const campaignMembersCollection = () => db().collection('campaignMembers')

// ---------------------------------------------------------------------------
// Normalization — old flat docs → new nested shape for frontend consumption
// ---------------------------------------------------------------------------

export function normalizeCampaign(campaign: any) {
  if (!campaign) return null

  return {
    _id: campaign._id,

    identity: campaign.identity ?? {
      name: campaign.name,
      description: campaign.description,
      setting: campaign.setting,
      edition: campaign.edition
    },

    configuration: campaign.configuration ?? {
      allowLegacyEditionNpcs: campaign.allowLegacyEditionNpcs ?? false,
      rules: {}
    },

    membership: campaign.membership ?? {
      adminId: campaign.adminId,
      members: campaign.members ?? []
    },

    participation: campaign.participation ?? {
      characters: (campaign.party ?? []).map((id: any) => ({
        characterId: id,
        status: 'active'
      }))
    },

    // Preserve flat accessors for backward compatibility during migration.
    // Downstream code (middleware, controllers, other services) that reads
    // campaign.adminId / campaign.name etc. will still work.
    name: campaign.identity?.name ?? campaign.name,
    description: campaign.identity?.description ?? campaign.description,
    setting: campaign.identity?.setting ?? campaign.setting,
    edition: campaign.identity?.edition ?? campaign.edition,
    adminId: campaign.membership?.adminId ?? campaign.adminId,
    members: campaign.membership?.members ?? campaign.members ?? [],
    party: campaign.party ?? [],

    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt,
  }
}

// ---------------------------------------------------------------------------
// Campaign CRUD
// ---------------------------------------------------------------------------

export async function getCampaignsForUser(userId: string, role: string) {
  const oid = new mongoose.Types.ObjectId(userId)

  // Get campaign IDs from CampaignMembers where user is a member
  const memberCampaignIds = await campaignMembersCollection()
    .distinct('campaignId', { userId: oid })

  const campaigns = await campaignsCollection()
    .find({
      $or: [
        // Match old flat adminId or new nested membership.adminId
        { adminId: oid },
        { 'membership.adminId': oid },
        { _id: { $in: memberCampaignIds } },
      ],
    })
    .toArray()

  return campaigns.map(normalizeCampaign)
}

export async function getCampaignById(id: string) {
  const campaign = await campaignsCollection().findOne({
    _id: new mongoose.Types.ObjectId(id),
  })
  return normalizeCampaign(campaign)
}

export async function createCampaign(
  adminId: string,
  data: { name: string; setting: string; edition: string; description?: string }
) {
  const now = new Date()
  const adminOid = new mongoose.Types.ObjectId(adminId)

  const result = await campaignsCollection().insertOne({
    // New nested structure
    identity: {
      name: data.name,
      description: data.description ?? '',
      setting: data.setting,
      edition: data.edition
    },
    configuration: {
      allowLegacyEditionNpcs: false,
      rules: {}
    },
    membership: {
      adminId: adminOid,
      members: []
    },
    participation: {
      characters: []
    },

    // Old flat fields (for backward compat until migration completes)
    name: data.name,
    description: data.description ?? '',
    setting: data.setting,
    edition: data.edition,
    party: [],
    adminId: adminOid,
    members: [],

    createdAt: now,
    updatedAt: now,
  })

  const campaign = await campaignsCollection().findOne({ _id: result.insertedId })
  return normalizeCampaign(campaign)
}

export async function updateCampaign(
  id: string,
  data: {
    name?: string
    setting?: string
    edition?: string
    description?: string
    allowLegacyEditionNpcs?: boolean
  }
) {
  const $set: Record<string, unknown> = { updatedAt: new Date() }

  // Write to both old flat fields and new nested fields
  if (data.name !== undefined) {
    $set.name = data.name
    $set['identity.name'] = data.name
  }
  if (data.description !== undefined) {
    $set.description = data.description
    $set['identity.description'] = data.description
  }
  if (data.setting !== undefined) {
    $set.setting = data.setting
    $set['identity.setting'] = data.setting
  }
  if (data.edition !== undefined) {
    $set.edition = data.edition
    $set['identity.edition'] = data.edition
  }
  if (data.allowLegacyEditionNpcs !== undefined) {
    $set['configuration.allowLegacyEditionNpcs'] = data.allowLegacyEditionNpcs
  }

  const campaign = await campaignsCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set },
    { returnDocument: 'after' },
  )
  return normalizeCampaign(campaign)
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
  const adminId = campaign.adminId as mongoose.Types.ObjectId

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
