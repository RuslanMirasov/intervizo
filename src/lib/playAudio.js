export const playAudio = audio => {
  return new Promise((resolve, reject) => {
    if (!audio) return reject(new Error('Аудио не найдено'));

    audio.onended = () => {
      URL.revokeObjectURL(audio.src);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(audio.src);
      reject(new Error('Ошибка воспроизведения аудио'));
    };
    audio.play();
  });
};
