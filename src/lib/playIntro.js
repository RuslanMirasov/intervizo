export function playIntro({ src = './interview_intro.mp3', onEnd, openPopup, closePopup }) {
  const audio = new Audio(src);
  let canceled = false;

  const finish = () => {
    if (!canceled && typeof onEnd === 'function') {
      onEnd();
    }
  };

  audio.addEventListener('ended', finish);

  audio.play().catch(err => {
    if (err.name === 'NotAllowedError' && typeof openPopup === 'function') {
      openPopup({
        locked: true,
        type: 'message',
        title: 'Инструкция',
        message: 'Прослушайте аудио инструкцию прежде чем начать интервью',
        action: () => {
          closePopup?.();
          audio.play().catch(console.warn);
        },
      });
    } else {
      console.warn('Ошибка воспроизведения аудио:', err);
    }
  });

  return () => {
    canceled = true;
    audio.pause();
    audio.currentTime = 0;
    audio.removeEventListener('ended', finish);
    closePopup?.();
  };
}
