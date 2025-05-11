'use client';

import { useEffect, useRef } from 'react';
import { usePopup } from '@/hooks/usePopup';

export function useIntro(src = './interview_intro.mp3', onEnd) {
  const audioRef = useRef(null);
  const { openPopup, closePopup } = usePopup();
  console.log('%c🔄 useIntro инициализируется', 'color: red');

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const popupAction = () => {
      closePopup();
      audio.play().catch(err => {
        console.warn('Ошибка воспроизведения аудио:', err);
      });
    };

    const tryPlay = async () => {
      try {
        await audio.play();
      } catch (err) {
        if (err.name === 'NotAllowedError') {
          openPopup({
            locked: true,
            type: 'message',
            title: 'Инструкция',
            message: 'Прослушайте аудио инструкцию прежде чем начать интервью',
            action: popupAction,
          });
        } else {
          console.warn('Не удалось воспроизвести аудио:', err);
        }
      }
    };

    const handleEnded = () => {
      if (typeof onEnd === 'function') {
        onEnd();
      }
    };

    audio.addEventListener('ended', handleEnded);
    tryPlay();

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [src, onEnd, openPopup, closePopup]);

  return audioRef;
}
