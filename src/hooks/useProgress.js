'use client';

import { useState, useEffect, useRef } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { useVoice } from '@/hooks/useVoice';
import { speak } from '@/lib/speak';

export const useProgress = () => {
  const { interview } = useInterview();
  const { isSpeaking, startListening, stopListening } = useVoice();

  const [stepPhase, setStepPhase] = useState('pause'); // 'pause' | 'thinking' | 'answering' | 'done'
  const [countdown, setCountdown] = useState(null);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef(null);
  const lastSpeechTimeRef = useRef(0);
  const isRunningRef = useRef(false);
  const currentStepRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startCountdown = (duration, onComplete) => {
    clearTimer();
    setCountdown(duration);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearTimer();
          onComplete?.();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finishAndContinue = () => {
    if (isRunningRef.current === false) return;
    isRunningRef.current = false;
    stopListening();
    clearTimer();
    setCountdown(null);
    setStepPhase('done');
    setTimeout(() => {
      runStep(currentStepRef.current + 1);
    }, 300);
  };

  const runStep = async step => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    if (step >= interview.data.length) {
      setStepPhase('pause');
      alert('Интервью завершено!');
      return;
    }

    currentStepRef.current = step;
    const { text, type } = interview.data[step];

    try {
      setLoading(true);
      await speak(text);
    } finally {
      setLoading(false);
    }

    startListening();

    if (type === 'message') {
      setStepPhase('done');
      isRunningRef.current = false;
      setTimeout(() => runStep(step + 1), 300);
      return;
    }

    setStepPhase('thinking');

    lastSpeechTimeRef.current = 0;
    startCountdown(15, finishAndContinue);
  };

  useEffect(() => {
    if (stepPhase === 'thinking' && isSpeaking) {
      setStepPhase('answering');
      return;
    }

    if (stepPhase === 'answering' && isSpeaking) {
      lastSpeechTimeRef.current = Date.now();
      startCountdown(8, finishAndContinue);
    }
  }, [stepPhase, isSpeaking]);

  const startInterview = () => runStep(0);

  return {
    interview,
    stepPhase,
    countdown,
    loading,
    startInterview,
    finishAnswer: finishAndContinue,
  };
};
