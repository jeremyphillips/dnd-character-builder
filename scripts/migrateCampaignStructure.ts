/**
 * One-time migration: restructure flat campaign documents into
 * the new nested shape (identity, configuration, membership, participation).
 *
 * Safe to run multiple times — only touches documents that lack `identity`.
 *
 * Usage:
 *   npx tsx scripts/migrateCampaignStructure.ts
 */
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME ?? 'dnd'

async function migrate() {
  await mongoose.connect(MONGO_URI)
  const db = mongoose.connection.useDb(DB_NAME)
  const campaigns = db.collection('campaigns')

  const cursor = campaigns.find({ identity: { $exists: false } })
  let migrated = 0

  for await (const doc of cursor) {
    await campaigns.updateOne(
      { _id: doc._id },
      {
        $set: {
          identity: {
            name: doc.name,
            description: doc.description ?? '',
            setting: doc.setting,
            edition: doc.edition
          },
          configuration: {
            allowLegacyEditionNpcs: (doc as any).allowLegacyEditionNpcs ?? false,
            rules: {}
          },
          membership: {
            adminId: doc.adminId,
            members: doc.members ?? []
          },
          participation: {
            characters: ((doc.party as any[]) ?? []).map((id: any) => ({
              characterId: id,
              status: 'active',
              joinedAt: doc.createdAt ?? new Date()
            }))
          }
        }
      }
    )
    migrated++
  }

  console.log(`Migration complete. ${migrated} campaign(s) updated.`)
  await mongoose.disconnect()
  process.exit(0)
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
