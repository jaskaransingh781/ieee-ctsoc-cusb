import mongoose from 'mongoose';

const cyberhuntStateSchema = new mongoose.Schema({
  _id: { type: String, default: 'cyberhunt' },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
}, { minimize: false, timestamps: true });

export const CyberhuntState = mongoose.models.CyberhuntState
  || mongoose.model('CyberhuntState', cyberhuntStateSchema);
