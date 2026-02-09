import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { env } from '../config/env'
import { signToken } from '../utils/jwt'

interface LoginResult {
  token: string
  user: { id: string; username: string; email: string; role: string }
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
  }
}
