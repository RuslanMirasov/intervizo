export const speak = async (text, route = '/api/speak') => {
  if (!text) throw new Error('Текст для озвучки отсутствует');

  const response = await fetch(route, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error || 'Ошибка при озвучивании текста');
  }

  const audioBuffer = await response.arrayBuffer();
  const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Ошибка воспроизведения аудио'));
    };
    audio.play();
  });
};
