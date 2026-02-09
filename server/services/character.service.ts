import mongoose from 'mongoose'
import { env } from '../config/env'

const charactersCollection = () => mongoose.connection.useDb(env.DB_NAME).collection('characters')

export async function getCharactersByUser(userId: string) {
  return charactersCollection()
    .find({ userId: new mongoose.Types.ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function getCharacterById(id: string) {
  return charactersCollection().findOne({ _id: new mongoose.Types.ObjectId(id) })
}

interface CharacterData {
  name: string
  race?: string
  class?: string
  level?: number
  alignment?: string
  edition?: string
  equipment?: string[]
}

export async function createCharacter(userId: string, data: CharacterData) {
  const now = new Date()
  const result = await charactersCollection().insertOne({
    userId: new mongoose.Types.ObjectId(userId),
    name: data.name,
    race: data.race ?? '',
    class: data.class ?? '',
    level: data.level ?? 1,
    alignment: data.alignment ?? '',
    edition: data.edition ?? '',
    equipment: data.equipment ?? [],
    createdAt: now,
    updatedAt: now,
  })

  return charactersCollection().findOne({ _id: result.insertedId })
}

export async function updateCharacter(id: string, data: Partial<CharacterData>) {
  return charactersCollection().findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' },
  )
}

export async function deleteCharacter(id: string) {
  return charactersCollection().deleteOne({ _id: new mongoose.Types.ObjectId(id) })
}
