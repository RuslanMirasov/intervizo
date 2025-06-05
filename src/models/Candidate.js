import mongoose, { Schema } from 'mongoose';
import { z } from 'zod';

// ==================== ZOD ВАЛИДАЦИЯ ====================

const ProgressItemSchema = z.object({
  id: z.number().optional(),
  question: z.string().or(z.literal('')).nullable().optional(),
  answer: z.string().or(z.literal('')).nullable().optional(),
  feedback: z.string().or(z.literal('')).nullable().optional(),
  score: z.number().min(0).max(5).optional(),
});

export const ProgressSchema = z.object({
  company: z.string().min(1, 'Не указана компания'),
  interviewId: z.string().min(1, 'Не указан ID интервью'),
  position: z.string().min(1, 'Должность не указана'),
  video: z.string().nullable().optional(),
  owners: z.array(z.string().email()).min(1, 'К интервью не закреплён ни один HR менеджер'),
  name: z.string().min(1, 'Имя и фамилия кандидата не указаны'),
  email: z.string().email('E-mail кандидата не указан либо введён в неправильном формате'),
  totalScore: z.number().min(0).max(5),
  data: z.array(ProgressItemSchema),
});

// ==================== Mongoose Schema =======================

const CandidateItemSchema = new Schema(
  {
    id: { type: Number, required: true },

    question: {
      type: String,
      default: null,
      required: false,
      nullable: true,
    },

    answer: {
      type: String,
      default: null,
      required: false,
      nullable: true,
    },

    feedback: {
      type: String,
      default: null,
      required: false,
      nullable: true,
    },

    score: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 5,
    },
  },
  { _id: false }
);

const CandidateSchema = new Schema(
  {
    company: { type: String, required: true },
    position: { type: String, required: true },
    interviewId: { type: String, required: true },
    owners: {
      type: [String],
      required: true,
      validate: {
        validator: arr => arr.length > 0,
        message: 'Нужен хотя бы один email HR менеджера',
      },
    },
    name: { type: String, required: true },
    video: { type: String, default: '' },
    email: { type: String, required: true }, // уникальность на уровне базы
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    data: { type: [CandidateItemSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ==================== МОДЕЛЬ ====================

const Candidate = mongoose.models.Candidate || mongoose.model('Candidate', CandidateSchema);

export default Candidate;
