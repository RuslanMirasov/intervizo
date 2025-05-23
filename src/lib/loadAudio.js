export const loadAudio = async text => {
  if (!text) throw new Error('Текст для озвучки отсутствует');

  const response = await fetch('/api/speak', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Ошибка при генерации аудио');
  }

  const audioBuffer = await response.arrayBuffer();

  if (!audioBuffer || audioBuffer.byteLength === 0) {
    throw new Error('Пустой аудиофайл');
  }

  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);

  const audio = new Audio(url);
  audio.preload = 'auto';

  return audio;
};
