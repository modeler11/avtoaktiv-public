import mongoose, { Document, Schema } from 'mongoose';

export interface ICodeInjection extends Document {
  headerCode: string;
  updatedAt: Date;
}

const codeInjectionSchema = new Schema({
  headerCode: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const CodeInjection = mongoose.model<ICodeInjection>('CodeInjection', codeInjectionSchema); 