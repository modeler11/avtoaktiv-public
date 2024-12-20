import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, default: 'FaLaugh' },
  order: { type: Number, default: 0 },
  jokesCount: { type: Number, default: 0 },
  seo: {
    title: { 
      type: String,
      default: function(this: any) {
        return `${this.title} - Анекдоты и шутки | TxtForge`;
      }
    },
    description: { 
      type: String,
      default: function(this: any) {
        return `Коллекция самых смешных анекдотов и шуток в категории "${this.title}". Ежедневное обновление, только лучший юмор.`;
      }
    },
    keywords: { 
      type: String,
      default: function(this: any) {
        return `анекдоты ${this.title.toLowerCase()}, шутки, юмор, смешные истории`;
      }
    },
    tags: [{ 
      type: String,
      default: function(this: any) {
        return [this.title.toLowerCase(), 'анекдоты', 'юмор'];
      }
    }],
    h1: {
      type: String,
      default: function(this: any) {
        return `Анекдоты про ${this.title.toLowerCase()}`;
      }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Индексы для оптимизации поиска
sectionSchema.index({ slug: 1 });
sectionSchema.index({ order: 1 });
sectionSchema.index({ 'seo.tags': 1 });

export interface ISection extends mongoose.Document {
  title: string;
  slug: string;
  icon: string;
  order: number;
  jokesCount: number;
  seo: {
    title: string;
    description: string;
    keywords: string;
    tags: string[];
    h1: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const Section = mongoose.model<ISection>('Section', sectionSchema); 