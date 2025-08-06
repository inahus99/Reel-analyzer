// models/ReelAnalytics.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// 1) Document interface including Mongoose’s Document
export interface IReelAnalytics {
  shortcode: string;
  username?: string;
  profilePic?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  published?: Date;
  duration?: string;
  caption?: string;
  sentiment?: { score: number; comparative: number };
  createdAt?: Date;
}

// 2) Full Mongoose document type
export type ReelDocument = Document & IReelAnalytics;

// 3) Schema must use ReelDocument, not just IReelAnalytics
const ReelSchema = new Schema<ReelDocument>(
  {
    shortcode:  { type: String, required: true, unique: true },
    username:   { type: String },
    profilePic: { type: String },
    views:      { type: Number },
    likes:      { type: Number },
    comments:   { type: Number },
    shares:     { type: Number },
    published:  { type: Date },
    duration:   { type: String },
    caption:    { type: String },
    sentiment: {
      score:       { type: Number },
      comparative: { type: Number },
    },
    createdAt: { type: Date, default: () => new Date() },
  },
  {
    versionKey: false,
    timestamps: false,
  }
);

// 4) Model type
export type ReelModel = Model<ReelDocument>;

// 5) Export the model, reusing existing if compiled
export const ReelAnalytics: ReelModel =
  (mongoose.models.ReelAnalytics as ReelModel) ||
  mongoose.model<ReelDocument>('ReelAnalytics', ReelSchema);
