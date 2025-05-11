'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from 'react';

import { useInterview } from '@/hooks/useInterview';
import { useVoice } from '@/hooks/useVoice';
import { startCountdown } from '@/lib/startCountdown';
import { ProgressUiProvider } from './ProgressUiContext';
import { speak } from '@/lib/speak';

const ProgressContext = createContext(null);

export const ProgressProvider = ({ children }) => {
  const { interview } = useInterview();
  const { isSpeaking, startListening, stopListening } = useVoice();

  const [stepPhase, setStepPhase] = useState('stop'); // 'stop' | 'thinking' | 'answering'
  const [step, setStep] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stepPhase === 'thinking') {
      startCountdown(15, () => setStep(prev => prev + 1), setCountdown);
    } else if (stepPhase === 'answering') {
      startCountdown(4, () => setStep(prev => prev + 1), setCountdown);
    } else {
      startCountdown();
    }
  }, [stepPhase]);

  useEffect(() => {
    if (step === null) return;
    runStep(step);
  }, [step]);

  useEffect(() => {
    if (stepPhase === 'thinking') {
      setStepPhase('answering');
    } else if (stepPhase === 'answering') {
      startCountdown(4, () => setStep(prev => prev + 1), setCountdown);
      console.log(isSpeaking);
    }
  }, [isSpeaking]);

  // ОСТАНАВЛИВАЕМ ИНТЕРВЬЮ
  const stopInterview = useCallback(() => {
    alert('Интервью закончено');
  }, []);

  // ЗАПУСКАЕМ ИНТЕРВЬЮ
  const startInterview = useCallback(() => {
    console.log('Интервью Началось');
    console.log('---------------------------------------');
    startListening();
    setStep(0);
  }, [interview, stopInterview]);

  //СБРОС ВСЕХ НАСТРОЕК ПЕРЕД ШАГОМ
  const resetStep = () => {
    setStepPhase('stop');
    startCountdown();
  };

  // СТАРТ КОНКРЕТНОГО ШАГА
  const runStep = async step => {
    await resetStep();

    if (step >= interview.data.length) {
      stopInterview();
      return;
    }

    const { type, text } = interview.data[step];

    //await speak(text);

    if (type === 'message') {
      console.log('Это сообщение ШАГ-' + step);
      setStep(prev => prev + 1);
      return;
    }

    console.log('Это уже вопрос ШАГ-' + step);
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
