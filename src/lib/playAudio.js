let currentAudio = null; // глобальный контроллер

export const playAudio = src => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Аудио можно проигрывать только в браузере'));
    }

    // Остановим предыдущее аудио, если оно играет
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }

    const audio = new Audio(src);
    currentAudio = audio;

    const cleanup = () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      if (currentAudio === audio) {
        currentAudio = null;
      }
    };

    const handleEnded = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(new Error('Ошибка воспроизведения аудио'));
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    const playPromise = audio.play();

    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch(err => {
        cleanup();

        if (err.name === 'NotAllowedError') {
          window.history.back();
        }

        reject(err);
      });
    }
  });
};
