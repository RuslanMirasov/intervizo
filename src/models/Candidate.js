import mongoose, { Schema } from 'mongoose';
import { z } from 'zod';

// ==================== ZOD ВАЛИДАЦИЯ ====================

const ProgressItemSchema = z.object({
  id: z.number(),
  question: z.string(),
  answer: z.string(),
  feedback: z.string(),
  score: z.number().min(0).max(5),
});

export const ProgressSchema = z.object({
  company: z.string().min(1, 'Не указана компания'),
  interviewId: z.string().min(1, 'Не указан ID интервью'),
  position: z.string().min(1, 'Должность не указана'),
  video: z.string(),
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
    question: { type: String, required: true },
    answer: { type: String, required: true },
    feedback: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 5 },
  },
  { _id: false } // чтобы не генерировать под _id в массиве data
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
    email: { type: String, required: true, unique: true }, // уникальность на уровне базы
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
