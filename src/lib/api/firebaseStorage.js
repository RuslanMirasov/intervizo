import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export class FirebaseStorageService {
  // Проверка существования папки компании
  static async checkCompanyFolder(companyName) {
    try {
      const companyRef = ref(storage, `InterVizo/${companyName}/`);
      const result = await listAll(companyRef);
      return result.prefixes.length > 0 || result.items.length > 0;
    } catch (error) {
      // Папка не существует
      return false;
    }
  }

  // Создание структуры папок для компании (автоматически при первой загрузке)
  static async ensureCompanyStructure(companyName) {
    const exists = await this.checkCompanyFolder(companyName);
    if (!exists) {
      // Папки создаются автоматически при загрузке первого файла
    }
    return true;
  }

  // Загрузка одного аудио файла
  static async uploadInterviewAudio(companyName, interviewId, questionIndex, audioBuffer) {
    try {
      // Убеждаемся что структура папок существует
      await this.ensureCompanyStructure(companyName);

      // Создаем путь: InterVizo/company_name/interview_id/question_index.mp3
      const filePath = `InterVizo/${companyName}/${interviewId}/${questionIndex}.mp3`;

      // Создаем ссылку на файл
      const storageRef = ref(storage, filePath);

      // Загружаем файл
      const snapshot = await uploadBytes(storageRef, audioBuffer, {
        contentType: 'audio/mpeg',
        customMetadata: {
          companyName: companyName,
          interviewId: interviewId,
          questionIndex: questionIndex.toString(),
          uploadedAt: new Date().toISOString(),
        },
      });

      // Получаем публичный URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      return {
        success: true,
        url: downloadURL,
        path: filePath,
        size: snapshot.metadata.size,
        questionIndex: questionIndex,
      };
    } catch (error) {
      console.error(`❌ Upload failed for question ${questionIndex}:`, error);
      throw error;
    }
  }

  // Загрузка всех аудио для интервью
  static async uploadAllInterviewAudio(companyName, interviewId, questionsData) {
    // Фильтруем только вопросы и сообщения с текстом
    const itemsToProcess = questionsData.filter(item => item.text && item.text.trim().length > 0);

    const uploadPromises = itemsToProcess.map(async (item, index) => {
      try {
        // Генерируем аудио
        const audioBuffer = await this.generateAudio(item.text);

        // Загружаем в Firebase
        const result = await this.uploadInterviewAudio(companyName, interviewId, index, audioBuffer);

        return {
          questionId: item.id,
          index: index,
          audioUrl: result.url,
          audioPath: result.path,
          success: true,
          type: item.type,
          text: item.text.substring(0, 100) + '...',
        };
      } catch (error) {
        console.error(`❌ Failed to upload audio for item ${index}:`, error);
        return {
          questionId: item.id,
          index: index,
          audioUrl: null,
          error: error.message,
          success: false,
          type: item.type,
        };
      }
    });

    const results = await Promise.allSettled(uploadPromises);
    const processedResults = results.map(result => (result.status === 'fulfilled' ? result.value : result.reason));
    return processedResults;
  }

  // Генерация аудио через ElevenLabs
  static async generateAudio(text) {
    const response = await fetch('/api/speak-eleven', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Audio generation failed: ${response.status} - ${errorText}`);
    }

    return await response.arrayBuffer();
  }

  // Удаление всего интервью
  static async deleteInterviewAudio(companyName, interviewId) {
    try {
      const interviewRef = ref(storage, `InterVizo/${companyName}/${interviewId}/`);
      const result = await listAll(interviewRef);

      // Удаляем все файлы в папке интервью
      const deletePromises = result.items.map(item => deleteObject(item));
      await Promise.all(deletePromises);

      return { success: true, deletedCount: result.items.length };
    } catch (error) {
      console.error('Delete failed:', error);
      throw error;
    }
  }

  // Получение списка интервью компании
  static async getCompanyInterviews(companyName) {
    try {
      const companyRef = ref(storage, `InterVizo/${companyName}/`);
      const result = await listAll(companyRef);

      return result.prefixes.map(prefix => {
        const pathParts = prefix.fullPath.split('/');
        return pathParts[pathParts.length - 1]; // ID интервью
      });
    } catch (error) {
      console.error('Failed to get company interviews:', error);
      return [];
    }
  }

  // Получение всех аудио файлов интервью
  static async getInterviewAudioFiles(companyName, interviewId) {
    try {
      const interviewRef = ref(storage, `InterVizo/${companyName}/${interviewId}/`);
      const result = await listAll(interviewRef);

      const audioFiles = await Promise.all(
        result.items.map(async item => {
          const url = await getDownloadURL(item);
          const pathParts = item.name.split('.');
          const questionIndex = Number.parseInt(pathParts[0]);

          return {
            questionIndex,
            url,
            name: item.name,
            fullPath: item.fullPath,
          };
        })
      );

      // Сортируем по индексу вопроса
      return audioFiles.sort((a, b) => a.questionIndex - b.questionIndex);
    } catch (error) {
      console.error('Failed to get interview audio files:', error);
      return [];
    }
  }
}
