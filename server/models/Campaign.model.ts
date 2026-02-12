import mongoose, { Schema } from 'mongoose'

const campaignMemberSchema = new Schema({
  userId:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role:     { type: String, enum: ['dm', 'player', 'observer'], default: 'player' },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false })

const campaignSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    setting: { type: String, required: true },
    edition: { type: String, required: true },

    party: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Character'
      }
    ],

    adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    members: { type: [campaignMemberSchema], default: [] }
  },
  { timestamps: true }
)

export const Campaign = mongoose.model('Campaign', campaignSchema)
