import mongoose, { Schema } from 'mongoose'

const characterSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name:      { type: String, required: true },
  race:      { type: String },
  class:     { type: String },
  level:     { type: Number, default: 1 },
  alignment: { type: String },
  edition:   { type: String },
  equipment: { type: [String], default: [] },
}, { timestamps: true })

export const Character = mongoose.model('Character', characterSchema)
