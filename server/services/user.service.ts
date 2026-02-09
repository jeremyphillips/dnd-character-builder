import mongoose from 'mongoose'
import { env } from '../config/env'

const usersCollection = () => mongoose.connection.useDb(env.DB_NAME).collection('users')

export async function getAllUsers() {
  return usersCollection()
    .find({}, { projection: { passwordHash: 0 } })
    .toArray()
}

export async function getUserById(id: string) {
  return usersCollection().findOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { projection: { passwordHash: 0 } },
  )
}

export async function updateUserRole(id: string, role: 'superadmin' | 'admin' | 'user') {
  const result = await usersCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { role, updatedAt: new Date() } },
    { returnDocument: 'after', projection: { passwordHash: 0 } },
  )
  return result
}
