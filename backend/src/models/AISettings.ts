import mongoose from 'mongoose';

const aiModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  modelId: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const aiSettingsSchema = new mongoose.Schema({
  openrouterApiKey: { type: String, required: false },
  models: [aiModelSchema],
  updatedAt: { type: Date, default: Date.now }
});

export const AISettings = mongoose.model('AISettings', aiSettingsSchema); 