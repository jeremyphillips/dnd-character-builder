import mongoose from 'mongoose'
import { env } from '../config/env'
import type { CharacterCore, CharacterDoc } from '../../shared/types'

const db = () => mongoose.connection.useDb(env.DB_NAME)
const charactersCollection = () => db().collection('characters')

export async function getCharactersByUser(userId: string) {
  return charactersCollection()
    .find({ userId: new mongoose.Types.ObjectId(userId), deletedAt: { $exists: false } })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function getCharacterById(id: string) {
  return charactersCollection().findOne({ _id: new mongoose.Types.ObjectId(id) })
}

export async function createCharacter(userId: string, data: CharacterDoc) {
  const now = new Date()
  const result = await charactersCollection().insertOne({
    userId: new mongoose.Types.ObjectId(userId),
    name: data.name,
    type: data.type ?? 'pc',
    imageUrl: data.imageUrl ?? null,
    race: data.race ?? '',
    classes: data.classes ?? [],
    totalLevel: data.totalLevel ?? 1,
    alignment: data.alignment ?? '',
    edition: data.edition ?? '',
    setting: data.setting ?? '',
    xp: data.xp ?? 0,
    equipment: data.equipment ?? { armor: [], weapons: [], gear: [], weight: 0 },
    wealth: data.wealth ?? { gp: 0, sp: 0, cp: 0 },
    stats: data.stats ?? {},
    hitPoints: data.hitPoints ?? {},
    armorClass: data.armorClass ?? {},
    proficiencies: data.proficiencies ?? [],
    narrative: data.narrative ?? {},
    ai: data.ai ?? {},
    generation: data.generation ?? {},
    createdAt: now,
    updatedAt: now,
  })

  return charactersCollection().findOne({ _id: result.insertedId })
}

export async function updateCharacter(id: string, data: Partial<CharacterData>) {
  // Strip out undefined values so we don't overwrite with undefined
  const cleaned = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  )
  return charactersCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { ...cleaned, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
}

export async function deleteCharacter(id: string) {
  return charactersCollection().deleteOne({ _id: new mongoose.Types.ObjectId(id) })
}

export async function softDeleteCharacter(id: string) {
  return charactersCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { deletedAt: new Date() } },
    { returnDocument: 'after' },
  )
}

/**
 * Get campaigns a character is part of (via CampaignMember) or owner's campaigns.
 */
export async function getCampaignsForCharacter(characterId: string) {
  const character = await getCharacterById(characterId)
  if (!character) return []

  const userId = character.userId as mongoose.Types.ObjectId
  const campaignMembersCol = db().collection('campaignMembers')

  // Fetch campaign member docs for this character
  const memberDocs = await campaignMembersCol
    .find({
      characterId: new mongoose.Types.ObjectId(characterId),
      $or: [
        { status: 'pending' },
        { status: 'approved' },
        { status: { $exists: false } },
      ],
    })
    .toArray() as { _id: mongoose.Types.ObjectId; campaignId: mongoose.Types.ObjectId; characterStatus?: string }[]

  const memberCampaignIds = memberDocs.map(m => m.campaignId)

  const campaigns = await db()
    .collection('campaigns')
    .find({
      $or: [{ 'membership.adminId': userId }, { _id: { $in: memberCampaignIds } }],
    })
    .project({ identity: 1, 'membership.adminId': 1 })
    .toArray()

  // Resolve DM names
  const adminIds = [...new Set(campaigns.map(c => c.membership?.adminId?.toString()).filter(Boolean))]
  const usersCol = db().collection('users')
  const admins = adminIds.length > 0
    ? await usersCol.find({ _id: { $in: adminIds.map(id => new mongoose.Types.ObjectId(id)) } }).project({ username: 1 }).toArray()
    : []
  const adminNameMap = new Map(admins.map(u => [u._id.toString(), u.username]))

  // Build member lookup by campaignId
  const memberByCampaignId = new Map(
    memberDocs.map(m => [m.campaignId.toString(), m]),
  )

  return campaigns.map(c => {
    const member = memberByCampaignId.get(c._id.toString())
    return {
      _id: c._id,
      identity: c.identity,
      dmName: adminNameMap.get(c.membership?.adminId?.toString()) ?? undefined,
      campaignMemberId: member?._id?.toString(),
      characterStatus: (member?.characterStatus ?? 'active') as string,
    }
  })
}

/**
 * Get pending campaign memberships for a character that the given user (as campaign admin) can approve/reject.
 */
export async function getPendingMembershipsForAdmin(
  characterId: string,
  adminUserId: string
): Promise<{ campaignId: string; campaignName: string; campaignMemberId: string }[]> {
  const campaignMembersCol = db().collection('campaignMembers')
  const campaignsCol = db().collection('campaigns')

  const members = await campaignMembersCol
    .find({
      characterId: new mongoose.Types.ObjectId(characterId),
      status: 'pending',
    })
    .toArray()

  const result: { campaignId: string; campaignName: string; campaignMemberId: string }[] = []
  for (const m of members as { _id: mongoose.Types.ObjectId; campaignId: mongoose.Types.ObjectId }[]) {
    const campaign = await campaignsCol.findOne({ _id: m.campaignId })
    const isAdmin = campaign?.membership?.adminId?.equals(new mongoose.Types.ObjectId(adminUserId))
    if (isAdmin && campaign) {
      result.push({
        campaignId: m.campaignId.toString(),
        campaignName: campaign.identity?.name as string,
        campaignMemberId: m._id.toString(),
      })
    }
  }
  return result
}

/**
 * Check whether a user is the campaign admin (DM) for any campaign
 * this character belongs to.
 */
export async function isCampaignAdminForCharacter(
  characterId: string,
  userId: string,
): Promise<boolean> {
  const uid = new mongoose.Types.ObjectId(userId)
  const campaignMembersCol = db().collection('campaignMembers')

  // Find campaigns this character is a member of
  const campaignIds = await campaignMembersCol.distinct('campaignId', {
    characterId: new mongoose.Types.ObjectId(characterId),
    $or: [
      { status: 'approved' },
      { status: 'pending' },
      { status: { $exists: false } },
    ],
  })

  if (campaignIds.length === 0) return false

  // Check if the user is the adminId of any of those campaigns
  const match = await db()
    .collection('campaigns')
    .findOne({
      _id: { $in: campaignIds },
      'membership.adminId': uid,
    })

  return match !== null
}

/**
 * Get user's characters that are not in any campaign (available for invite accept).
 */
export async function getCharactersAvailableForCampaign(userId: string) {
  const characters = await getCharactersByUser(userId)
  const campaignMemberService = await import('./campaignMember.service')

  const available: typeof characters = []
  for (const c of characters) {
    const inCampaign = await campaignMemberService.isCharacterInCampaign(c._id.toString())
    if (!inCampaign) available.push(c)
  }
  return available
}
