import mongoose, { Schema } from 'mongoose'

const campaignMemberSchema = new Schema({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role:     { type: String, enum: ['dm', 'player', 'observer'], default: 'player' },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false })

const campaignSchema = new Schema(
  {
    identity: {
      name: String,
      description: String,
      setting: String,
      edition: String
    },

    configuration: {
      allowLegacyEditionNpcs: { type: Boolean, default: false },
      rules: { type: Schema.Types.Mixed, default: {} }
    },

    membership: {
      adminId: { type: Schema.Types.ObjectId, ref: 'User' },
      members: { type: [campaignMemberSchema], default: [] }
    },

    participation: {
      characters: [
        {
          characterId: { type: Schema.Types.ObjectId, ref: 'Character' },
          status: { type: String, enum: ['active', 'inactive', 'deceased'], default: 'active' },
          joinedAt: Date
        }
      ]
    }
  },
  { timestamps: true }
)

export const Campaign = mongoose.model('Campaign', campaignSchema)
