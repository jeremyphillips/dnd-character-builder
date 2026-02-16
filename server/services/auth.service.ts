import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { env } from '../config/env'
import { signToken } from '../utils/jwt'
import { getPublicUrl, normalizeImageKey } from './image.service'

interface NotificationPreferences {
  sessionScheduled: boolean
  inviteReceived: boolean
  mentionedInChat: boolean
}

interface AuthUserPayload {
  id: string
  username: string
  email: string
  role: string
  firstName?: string
  lastName?: string
  avatarKey?: string | null
  avatarUrl?: string
  bio?: string
  website?: string
  notificationPreferences: NotificationPreferences
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  sessionScheduled: true,
  inviteReceived: true,
  mentionedInChat: true,
}

interface LoginResult {
  token: string
  user: AuthUserPayload
}

export async function loginUser(email: string, password: string): Promise<LoginResult | null> {
  const db = mongoose.connection.useDb(env.DB_NAME)
  const user = await db.collection('users').findOne({ email })

  if (!user || !user.active) return null

  const valid = await bcrypt.compare(password, user.passwordHash as string)
  if (!valid) return null

  const token = signToken({ userId: user._id.toString(), role: user.role as string })

  return {
    token,
    user: {
      id: user._id.toString(),
      username: user.username as string,
      email: user.email as string,
      role: user.role as string,
      firstName: (user.firstName as string) ?? undefined,
      lastName: (user.lastName as string) ?? undefined,
      avatarKey: (user.avatarKey as string) ?? null,
      avatarUrl: getPublicUrl(user.avatarKey as string),
      bio: (user.bio as string) ?? undefined,
      website: (user.website as string) ?? undefined,
      notificationPreferences: {
        ...DEFAULT_NOTIFICATION_PREFS,
        ...(user.notificationPreferences as Partial<NotificationPreferences> | undefined),
      },
    },
  }
}

export async function getUserById(userId: string) {
  const db = mongoose.connection.useDb(env.DB_NAME)
  const user = await db.collection('users').findOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    { projection: { passwordHash: 0 } },
  )

  if (!user) return null

  return {
    id: user._id.toString(),
    username: user.username as string,
    email: user.email as string,
    role: user.role as string,
    firstName: (user.firstName as string) ?? undefined,
    lastName: (user.lastName as string) ?? undefined,
    avatarKey: (user.avatarKey as string) ?? null,
    avatarUrl: getPublicUrl(user.avatarKey as string),
    bio: (user.bio as string) ?? undefined,
    website: (user.website as string) ?? undefined,
    notificationPreferences: {
      ...DEFAULT_NOTIFICATION_PREFS,
      ...(user.notificationPreferences as Partial<NotificationPreferences> | undefined),
    },
  }
}

export async function updateProfile(
  userId: string,
  data: {
    firstName?: string
    lastName?: string
    username?: string
    avatarKey?: string | null
    bio?: string
    website?: string
    email?: string
    notificationPreferences?: Partial<NotificationPreferences>
  },
) {
  const db = mongoose.connection.useDb(env.DB_NAME)
  const $set: Record<string, unknown> = {}

  if (data.firstName !== undefined) $set.firstName = data.firstName
  if (data.lastName !== undefined) $set.lastName = data.lastName
  if (data.username !== undefined) $set.username = data.username
  if (data.avatarKey !== undefined) $set.avatarKey = normalizeImageKey(data.avatarKey)
  if (data.bio !== undefined) $set.bio = data.bio
  if (data.website !== undefined) $set.website = data.website
  if (data.email !== undefined) $set.email = data.email

  if (data.notificationPreferences) {
    for (const [key, val] of Object.entries(data.notificationPreferences)) {
      if (val !== undefined) {
        $set[`notificationPreferences.${key}`] = val
      }
    }
  }

  if (Object.keys($set).length === 0) return getUserById(userId)

  await db.collection('users').updateOne(
    { _id: new mongoose.Types.ObjectId(userId) },
    { $set },
  )

  return getUserById(userId)
}
