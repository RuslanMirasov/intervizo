import { isBadText } from './isBadText';

export async function transcribeVoice(blob) {
  // Валидация входных данных
  if (!blob || !(blob instanceof Blob)) {
    console.error('transcribeVoice: Некорректный blob');
    return '';
  }

  if (blob.size === 0) {
    console.warn('transcribeVoice: Пустой blob');
    return '';
  }

  try {
    const form = new FormData();
    form.append('audio', blob, 'audio.webm');

    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: form,
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Проверка структуры ответа
    if (!data || typeof data.text !== 'string') {
      throw new Error('Некорректный формат ответа от API при транскрибации аудио');
    }

    let { text } = data;
    text = text.trim();

    // Проверка на "мусорный" текст
    if (isBadText(text)) {
      console.warn(`Ответ от Whisper признан мусором и заменён на пустую строку: "${text}"`);
      text = '';
    }

    return text;
  } catch (err) {
    console.error('Ошибка транскрибации:', err);
    return '';
  }
}
