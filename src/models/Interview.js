import mongoose from 'mongoose';
import { z } from 'zod';

// ==================== ZOD ВАЛИДАЦИЯ ====================

// Схема для элемента data
const InterviewDataItemSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['message', 'question']),
  text: z
    .string()
    .min(1, 'Вы пытаетесь сохранить пустое поле вопроса или сообщения. Убедитесь, что все поля заполнены текстом.'),
  audio: z.string().optional().default(''),
  video: z.string().optional().default(''),
});

// Основная схема интервью
export const InterviewValidationSchema = z.object({
  company: z.string().min(1, 'Компания не указана'),
  owners: z
    .array(
      z
        .string()
        .regex(
          /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
          'При попытке добавить владельца был передан не верный формат e-mail.'
        )
    )
    .min(1, 'Владелец не указан, добавьте e-mail'),
  slug: z.string().min(1, 'slug не передан'),
  name: z.string().min(1, 'Введите название интервью!'),
  category: z.string().min(1, 'Выберите категорию'),
  description: z.string().optional().default(''),
  thumbnail: z
    .string()
    .optional()
    .refine(val => val === undefined || val === '' || /^#([0-9A-Fa-f]{6})$/.test(val) || /^https?:\/\/.+/.test(val), {
      message: 'Для превью опустимы: пустая строка, ссылка или цвет #RRGGBB',
    })
    .default(''),
  duration: z.preprocess(
    val => {
      if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
        return undefined; // вызовет ошибку "Required"
      }
      return typeof val === 'string' ? Number(val) : val;
    },
    z
      .number({
        required_error: 'Продолжительность интервью не указана',
        invalid_type_error: 'Введите число',
      })
      .min(1, 'Длительность интервью не указана')
  ),
  difficulty: z.enum(['Легкое', 'Среднее', 'Сложное'], {
    errorMap: () => ({ message: 'Выберите уровень сложности' }),
  }),
  data: z.array(InterviewDataItemSchema).min(1, 'Вы не добавили ни одного вопроса'),
});

// Схема для обновления (все поля опциональные)
export const InterviewUpdateSchema = InterviewValidationSchema.partial();

// Функции валидации
export function validateInterview(data) {
  return InterviewValidationSchema.safeParse(data);
}

export function validateInterviewUpdate(data) {
  return InterviewUpdateSchema.safeParse(data);
}

// ==================== MONGOOSE МОДЕЛЬ ====================

const InterviewDataSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['message', 'question'],
      required: true,
    },
    text: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    audio: {
      type: String,
      default: '',
    },
    video: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const InterviewSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: true,
      index: true,
    },
    owners: [
      {
        type: String,
        required: true,
        validate: {
          validator: email => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email),
          message: 'Не верный формат e-mail',
        },
      },
    ],
    slug: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: null,
      min: 0,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Легкое', 'Среднее', 'Сложное'],
      required: true,
    },
    data: [InterviewDataSchema],
  },
  {
    timestamps: true,
  }
);

// ==================== ИНДЕКСЫ ====================

InterviewSchema.index({ company: 1, createdAt: -1 });
InterviewSchema.index({ owners: 1 });

// ==================== MIDDLEWARE ====================

// Валидация перед сохранением
InterviewSchema.pre('save', function (next) {
  const hasQuestion = this.data.some(item => item.type === 'question');
  if (!hasQuestion) {
    return next(new Error('Интервью должно иметь хотябы один вопрос'));
  }
  next();
});

// ==================== СТАТИЧЕСКИЕ МЕТОДЫ ====================

InterviewSchema.statics.findByCompany = function (company, options = {}) {
  const { page = 1, limit = 30, status } = options;
  const skip = (page - 1) * limit;

  const query = { company };
  if (status) query.audioStatus = status;

  return this.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

InterviewSchema.statics.findByOwner = function (email, options = {}) {
  const { page = 1, limit = 30 } = options;
  const skip = (page - 1) * limit;

  return this.find({ owners: email }).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

InterviewSchema.statics.findReadyForAudio = function () {
  return this.find({
    audioStatus: 'pending',
    'data.0': { $exists: true },
  });
};

// ==================== МЕТОДЫ ЭКЗЕМПЛЯРА ====================

InterviewSchema.methods.addOwner = function (email) {
  if (!this.owners.includes(email)) {
    this.owners.push(email);
  }
  return this.save();
};

InterviewSchema.methods.removeOwner = function (email) {
  if (this.owners.length <= 1) {
    throw new Error('Interview must have at least one owner');
  }
  this.owners = this.owners.filter(owner => owner !== email);
  return this.save();
};

InterviewSchema.methods.updateAudioUrl = function (itemId, audioUrl) {
  const item = this.data.find(d => d.id === itemId);
  if (item) {
    item.audio = audioUrl;
    return this.save();
  }
  throw new Error(`Item with id ${itemId} not found`);
};

InterviewSchema.methods.markAudioProcessing = function () {
  this.audioStatus = 'processing';
  return this.save();
};

InterviewSchema.methods.markAudioReady = function () {
  this.audioGenerated = true;
  this.audioStatus = 'ready';
  this.audioError = '';
  return this.save();
};

InterviewSchema.methods.markAudioFailed = function (error) {
  this.audioStatus = 'failed';
  this.audioError = error;
  return this.save();
};

InterviewSchema.methods.validateWithZod = function () {
  return validateInterview(this.toObject());
};

// ==================== ЭКСПОРТ ====================

const Interview = mongoose.models.Interview || mongoose.model('Interview', InterviewSchema);

export { Interview };
export default Interview;
