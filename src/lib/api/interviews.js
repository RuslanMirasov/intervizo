import connectDB from '@/lib/mongodb';
import { Interview, validateInterview } from '@/models/Interview';
import { FirebaseStorageService } from './firebaseStorage';

export class InterviewService {
  // Создание интервью с автоматической генерацией аудио
  static async createWithAudio(interviewData) {
    await connectDB();

    // Валидация данных
    const validation = validateInterview(interviewData);
    if (!validation.success) {
      throw new Error(`Ошибка валидации: ${validation.error.errors[0].message}`);
    }

    try {
      // Создаем интервью в MongoDB
      const interview = await Interview.create({
        ...validation.data,
        audioStatus: 'processing', // Помечаем как обрабатывается
      });

      // Запускаем генерацию аудио в фоне
      this.generateInterviewAudio(interview).catch(error => {
        console.error(`❌ Ошибка генерации аудио для интервью ${interview._id}:`, error);
        // Помечаем интервью как failed
        Interview.findByIdAndUpdate(interview._id, {
          audioStatus: 'failed',
          audioError: error.message,
        }).catch(console.error);
      });

      return interview;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Интервью с таким slug уже существует');
      }
      throw error;
    }
  }

  // Генерация аудио для интервью
  static async generateInterviewAudio(interview) {
    try {
      // Генерируем и загружаем аудио файлы
      const audioResults = await FirebaseStorageService.uploadAllInterviewAudio(
        interview.company,
        interview._id.toString(),
        interview.data
      );

      // Обновляем интервью с URL-ами аудио
      const updatedData = interview.data.map((item, index) => {
        const audioResult = audioResults.find(result => result.index === index);
        return {
          ...item,
          audio: audioResult?.audioUrl || '',
        };
      });

      // Сохраняем обновленное интервью
      await Interview.findByIdAndUpdate(interview._id, {
        data: updatedData,
        audioGenerated: true,
        audioStatus: 'ready',
        audioError: '',
      });

      return audioResults;
    } catch (error) {
      console.error(`❌ Ошибка генерации аудио:`, error);
      throw error;
    }
  }

  // Получение интервью по ID
  static async getById(id) {
    await connectDB();

    const interview = await Interview.findById(id);
    if (!interview) {
      throw new Error('Интервью не найдено');
    }
    return interview;
  }

  // Получение интервью по slug
  static async getBySlug(slug) {
    await connectDB();

    const interview = await Interview.findOne({ slug });
    if (!interview) {
      throw new Error('Интервью не найдено');
    }
    return interview;
  }

  // Получение интервью по компании
  static async getByCompany(company, options = {}) {
    await connectDB();

    return await Interview.findByCompany(company, options);
  }

  // Получение интервью по владельцу
  static async getByOwner(email, options = {}) {
    await connectDB();

    return await Interview.findByOwner(email, options);
  }
}
