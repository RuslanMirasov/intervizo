/**
 * Функция для сохранения аудиофайла из текста
 * @param {string} text - Текст для преобразования в аудио
 * @param {Object} options - Дополнительные параметры
 * @param {string} options.filename - Имя файла (по умолчанию генерируется автоматически)
 * @param {string} options.voice - Голос для озвучивания (по умолчанию 'onyx')
 * @returns {Promise<boolean>} - Результат операции
 */
export async function saveAudio(text, options = {}) {
  try {
    if (!text) {
      throw new Error('Текст для озвучивания не предоставлен');
    }

    const filename = options.filename || `audio_${Date.now()}.mp3`;
    const voice = options.voice || 'onyx';

    // Отправляем запрос на API
    const response = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        filename,
        voice,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ошибка при создании аудиофайла');
    }

    // Получаем аудио как Blob
    const audioBlob = await response.blob();

    // Создаем URL для скачивания
    const downloadUrl = window.URL.createObjectURL(audioBlob);

    // Создаем временную ссылку для скачивания
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;

    // Добавляем ссылку в DOM, кликаем и удаляем
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Освобождаем память
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    console.error('Ошибка при сохранении аудио:', error);
    throw error;
  }
}
