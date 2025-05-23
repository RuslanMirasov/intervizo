export const playAudio = src => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Аудио можно проигрывать только в браузере'));
    }

    const audio = new Audio(src);

    const cleanup = () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };

    const handleEnded = () => {
      cleanup();
      resolve();
    };

    const handleError = e => {
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
          console.log('Аудио не может быть воспроизведено без действия пользователя');
          window.history.back();
        }

        reject(err);
      });
    }
  });
};
