import mongoose, { Schema } from 'mongoose'
import type { CharacterSheet } from '../../shared/types'

const characterSheetSchema = new Schema<CharacterSheet>({
  classes: [{
    classId:           { type: String },
    classDefinitionId: { type: String },
    level:             { type: Number, required: true, default: 1 },
  }],
  xp:  { type: Number, required: true, default: 0 },
  totalLevel:  { type: Number, required: true, default: 0 },
  levelUpPending: { type: Boolean, default: false },
  edition:     { type: String },
  setting:     { type: String },
  race:        { type: String },
  wealth: {
    gp:     { type: Number, default: null },
    sp:     { type: Number, default: null },
    cp:     { type: Number, default: null },
    baseGp: { type: Number, default: null },
  },
  equipment: {
    armor:   { type: [String], default: [] },
    weapons: { type: [String], default: [] },
    gear:    { type: [String], default: [] },
    weight:  { type: Number, default: 0 },
  },
  alignment: { type: String },
}, { _id: false })

const campaignSchema = new Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  setting:     { type: String, required: true },
  edition:     { type: String, required: true },
  party:       { type: [characterSheetSchema], default: [] },
  adminId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members:     [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

export const Campaign = mongoose.model('Campaign', campaignSchema)
