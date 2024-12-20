import mongoose from 'mongoose';

const contentGeneratorSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  modelId: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  intervalMinutes: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: false
  },
  lastRun: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

export const ContentGenerator = mongoose.model('ContentGenerator', contentGeneratorSchema); 