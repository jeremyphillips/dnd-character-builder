import mongoose, { Schema } from 'mongoose'

const combatSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    revision: { type: Number, required: true },
    state: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
)

export const CombatSession =
  mongoose.models.CombatSession ?? mongoose.model('CombatSession', combatSessionSchema)
