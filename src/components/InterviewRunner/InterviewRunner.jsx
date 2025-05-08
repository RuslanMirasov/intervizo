'use client';

import { useState, useEffect, useRef } from 'react';
import { speak } from '@/lib/speak';
import useLocalStorageState from 'use-local-storage-state';
import { Button, Icon } from '@/components';
import { useVoice } from '@/hooks/useVoice';

const InterviewRunner = ({ interview, loading, setLoading, setCount }) => {
  const { isSpeaking, startListening, stopListening } = useVoice();

  const [stepPhase, setStepPhase] = useState('pause'); // 'pause' | 'thinking' | 'answering' | 'done'
  const [countdown, setCountdown] = useState(null);

  const timerRef = useRef(null);
  const lastSpeechTimeRef = useRef(0);
  const isRunningRef = useRef(false);
  const currentStepRef = useRef(0);

  const [interviewProgress, setInterviewProgress] = useLocalStorageState('interview-progress', {
    defaultValue: {
      slug: interview.slug,
      name: interview.name,
      user: {
        name: '',
        email: '',
        score: 0.0,
      },
      video: null,
      answers: [],
      done: false,
    },
  });

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
    setCount(countdown);
  }, [countdown, setCount]);

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

  return (
    <>
      {stepPhase === 'pause' && !loading && (
        <Button className="small border" onClick={() => runStep(0)}>
          Начать интервью
        </Button>
      )}

      {stepPhase === 'answering' && (
        <Button className="small" onClick={finishAndContinue}>
          Принять мой ответ
        </Button>
      )}

      {((stepPhase !== 'pause' && stepPhase !== 'answering') || loading) && (
        <Button href="./" className="small call">
          <Icon name="call" size="25" color="var(--white)" />
        </Button>
      )}
    </>
  );
};

export default InterviewRunner;
