import mongoose, { Schema, Document } from 'mongoose';

export interface IJokeInteraction extends Document {
  jokeId: mongoose.Types.ObjectId;
  clientId: string;
  type: 'view' | 'like' | 'dislike';
  createdAt: Date;
}

const jokeInteractionSchema = new Schema({
  jokeId: {
    type: Schema.Types.ObjectId,
    ref: 'Joke',
    required: true
  },
  clientId: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['view', 'like', 'dislike'],
    required: true
  }
}, {
  timestamps: true
});

// Составной индекс для уникальности взаимодействий
jokeInteractionSchema.index({ jokeId: 1, clientId: 1, type: 1 }, { unique: true });

export const JokeInteraction = mongoose.model<IJokeInteraction>('JokeInteraction', jokeInteractionSchema); 