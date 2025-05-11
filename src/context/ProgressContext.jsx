'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { useInterview } from '@/hooks/useInterview';
import { useVoice } from '@/hooks/useVoice';
import { startCountdown } from '@/lib/startCountdown';
import { ProgressUiProvider } from './ProgressUiContext';
import { loadAudio } from '@/lib/loadAudio';
import { playAudio } from '@/lib/playAudio';
import { transcribeVoice } from '@/lib/transcribeVoice';
import { speak } from '@/lib/speak';

const ProgressContext = createContext(null);

export const ProgressProvider = ({ children }) => {
  const [progress, setProgress] = useLocalStorageState('interview-progress', {
    defaultValue: [],
  });
  const { interview } = useInterview();
  const { isSpeaking, startListening, startRecording, stopRecording } = useVoice();

  const [stepPhase, setStepPhase] = useState('stop'); // 'stop' | 'thinking' | 'answering'
  const [step, setStep] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(false);

  const audioCache = useRef({});

  // ИЗМЕНЕНИЕ ФАЗЫ
  useEffect(() => {
    if (stepPhase === 'thinking') {
      startCountdown(15, () => saveAnswer(step), setCountdown);
    } else if (stepPhase === 'answering') {
      startCountdown(4, () => saveAnswer(step), setCountdown);
    } else {
      startCountdown();
    }
  }, [stepPhase]);

  // РЕАГИРУЕМ НА ИЗМЕНЕНИЕ ШАГА
  useEffect(() => {
    if (step === null) return;
    runStep(step);
  }, [step]);

  // СЛУШАЕМ РЕЧЬ
  useEffect(() => {
    if (stepPhase === 'thinking') setStepPhase('answering');
    else if (stepPhase === 'answering') startCountdown(4, () => saveAnswer(step), setCountdown);
  }, [isSpeaking]);

  // ОСТАНАВЛИВАЕМ ИНТЕРВЬЮ
  const stopInterview = useCallback(() => {
    console.log(progress);
    alert('Интервью закончено');
  }, []);

  // ЗАПУСКАЕМ ИНТЕРВЬЮ
  const startInterview = useCallback(() => {
    startListening();
    setStep(0);
  }, [interview, stopInterview]);

  const saveAnswer = async step => {
    try {
      const blob = await stopRecording();
      if (blob) {
        transcribeVoice(step, blob, setProgress);
      }
    } catch (err) {
      console.error('Ошибка при завершении записи и отправке:', err);
    } finally {
      setStep(prev => prev + 1);
    }
  };

  //СБРОС ВСЕХ НАСТРОЕК ПЕРЕД ШАГОМ
  const resetStep = () => {
    setStepPhase('stop');
    startCountdown();
  };

  // Предзагрузка следующего шага
  const preloadNextAudio = step => {
    const next = step + 1;
    const nextData = interview.data[next];
    if (nextData && !audioCache.current[next]) {
      loadAudio(nextData.text)
        .then(audio => {
          audioCache.current[next] = audio;
        })
        .catch(err => {
          console.warn('Ошибка предзагрузки аудио для следующего шага:', err);
        });
    }
  };

  // Получить и воспроизвести аудио
  const getAndPlayAudio = async (step, text) => {
    const cachedAudio = audioCache.current[step];
    if (cachedAudio) {
      try {
        await playAudio(cachedAudio);
      } catch (err) {
        console.error('Ошибка воспроизведения аудио:', err);
      }
    } else {
      try {
        const audio = await loadAudio(text);
        audioCache.current[step] = audio;
        await playAudio(audio);
      } catch (err) {
        console.error('Ошибка генерации или воспроизведения аудио:', err);
      }
    }
  };

  // СТАРТ КОНКРЕТНОГО ШАГА
  const runStep = async step => {
    resetStep();

    if (step >= interview.data.length) {
      stopInterview();
      return;
    }

    const { type, text } = interview.data[step];

    //await speak(text);
    preloadNextAudio(step);
    await getAndPlayAudio(step, text);

    if (type === 'message') {
      setStep(prev => prev + 1);
      return;
    }

    setProgress(prev => {
      if (prev.some(entry => entry.id === step)) return prev;

      return [
        ...prev,
        {
          id: step,
          question: text,
          answer: '',
          feedback: null,
          score: 0.0,
        },
      ];
    });

    startRecording();
    setStepPhase('thinking');
  };

  const contextValue = useMemo(
    () => ({
      startInterview,
      stopInterview,
    }),
    [startInterview, stopInterview]
  );

  const uiValue = useMemo(
    () => ({
      countdown,
      loading,
      stepPhase,
    }),
    [countdown, loading, stepPhase]
  );

  return (
    <ProgressContext.Provider value={contextValue}>
      <ProgressUiProvider value={uiValue}>{children}</ProgressUiProvider>
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
