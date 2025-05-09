'use client';

import { useEffect, useRef } from 'react';
import { usePopup } from '@/hooks/usePopup';

export function useIntro(src = './interview_intro.mp3') {
  const audioRef = useRef(null);
  const { openPopup, closePopup } = usePopup();

  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    const popupAction = () => {
      closePopup();
      audio.play();
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

    tryPlay();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [src, openPopup]);

  return audioRef;
}
