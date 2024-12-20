import mongoose, { Schema, Document } from 'mongoose';

export interface IJoke extends Document {
  sectionId: mongoose.Types.ObjectId;
  text: string;
  isPublished: boolean;
  views: number;
  likes: number;
  dislikes: number;
  isGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
  seo: {
    title: string;
    description: string;
    keywords: string;
    tags: string[];
  };
}

const jokeSchema = new Schema({
  sectionId: {
    type: Schema.Types.ObjectId,
    ref: 'Section',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  isGenerated: {
    type: Boolean,
    default: true
  },
  seo: {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    keywords: {
      type: String,
      required: true
    },
    tags: [{
      type: String,
      required: true
    }]
  }
}, {
  timestamps: true
});

// Индексы для быстрого поиска
jokeSchema.index({ sectionId: 1, createdAt: -1 });
jokeSchema.index({ isPublished: 1 });
jokeSchema.index({ views: -1 });
jokeSchema.index({ likes: -1 });
jokeSchema.index({ dislikes: -1 });
jokeSchema.index({ 'seo.tags': 1 });

export const Joke = mongoose.model<IJoke>('Joke', jokeSchema); 