'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { useVoice } from '@/hooks/useVoice';

import { useProgressStorage } from '@/hooks/useProgressStorage';
import { startCountdown } from '@/lib/startCountdown';
import { getRandomItemFromArray } from '@/lib/getRandomItemFromArray';
import { transcribeVoice } from '@/lib/transcribeVoice';
import { playAudio } from '@/lib/playAudio';
import { saveAudio } from '@/lib/save';
import { speak } from '@/lib/speak';
import { speakInBrowser } from '@/lib/speakInBrowser';
import { ProgressUiProvider } from './ProgressUiContext';
import { Preloader } from '@/components';

const ProgressContext = createContext(null);

export const ProgressProvider = ({ children }) => {
  const router = useRouter();
  const [interview, , { isPersistent }] = useLocalStorageState('interview');

  const { isSpeaking, triggerDetected, startRecord, stopRecord, resumeRecord } = useVoice();
  const { addQuestion, updateAnswer } = useProgressStorage();

  const [step, setStep] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const transcriptionPromises = useRef([]);

  // ЗАПУСКАЕМ ИНТЕРВЬЮ

  const startInterview = useCallback(async () => {
    if (interview?.data?.length > 0) {
      //await playAudio('./intro.mp3');
      setStep(0);
    }
  }, [interview]);

  const finishInterview = useCallback(async () => {
    await Promise.allSettled(transcriptionPromises.current);
    router.push('/scoring');
  }, [router]);

  //ПЕРЕХОД К CЛЕДУЮЩЕМУ ШАГУ
  const goToNextStep = useCallback(() => {
    setStep(prev => {
      const isLast = prev !== null && interview?.data && prev >= interview.data.length - 1;

      if (isLast) {
        finishInterview();
        return null;
      }

      return prev !== null ? prev + 1 : null;
    });
  }, [interview, finishInterview]);

  //ПЕРЕХОД К ШАГУ
  const goToStep = useCallback(
    async (number, isRepeat = false) => {
      const stepData = interview?.data?.[number];
      if (!stepData) return;

      const { text, type } = stepData;

      await speakInBrowser(text);
      //await speak(text);
      //await saveAudio(text, { filename: 'repeat.mp3', voice: 'onyx' }); //nova

      if (type === 'message') {
        setShowNextButton(false);
        goToNextStep();
        return;
      }

      addQuestion({ id: number, question: text });

      if (isRepeat) {
        await resumeRecord();
      } else {
        await startRecord();
      }

      startCountdown(15, () => saveAnswer(), setCountdown);
    },
    [interview]
  );

  const transcribeAnswer = async (id, blob) => {
    const transcriptionPromise = transcribeVoice(blob)
      .then(transcription => {
        updateAnswer(id, transcription);
        return { id, transcription, success: true };
      })
      .catch(error => {
        return { id, transcription: null, success: false, error };
      });

    transcriptionPromises.current.push(transcriptionPromise);
    return transcriptionPromise;
  };

  const saveAnswer = async () => {
    await startCountdown(0, () => setCountdown(0), setCountdown);
    await setShowNextButton(false);
    const recordedBlob = await stopRecord();

    if (recordedBlob) {
      transcribeAnswer(step, recordedBlob);
    }

    goToNextStep();
  };

  const repeatQuastion = async () => {
    await playAudio(getRandomItemFromArray(['/repeat.mp3', '/repeat2.mp3', '/repeat3.mp3']));
    goToStep(step, true);
  };

  const nextQuastion = async () => {
    await playAudio(getRandomItemFromArray(['/next.mp3', '/next2.mp3', '/next3.mp3']));
    saveAnswer();
  };
  // ========================================================================= ЭФФЕКТЫ

  // ЭФФЕКТ ЗАПУСКАЕТ ПЕРВЫЙ ШАГ ПРИ ЗАГРУЗКЕ
  useEffect(() => {
    if (isPersistent && interview && interview.data?.length > 0) {
      startInterview();
    }
  }, [isPersistent, interview]);

  //ЭФФЕКТ ЗАПУСКАЕТ СЛЕДУЮЩИЙ ШАГ ПРИ ИЗМЕНЕНИИ STEP
  useEffect(() => {
    if (step === null || !interview?.data || !interview.data[step]) return;
    goToStep(step);
  }, [step, interview]);

  // РЕАГИРУЕМ НА ГОЛОС
  useEffect(() => {
    if (!isSpeaking) return;
    setShowNextButton(true);
    startCountdown(5, () => saveAnswer(), setCountdown);
  }, [isSpeaking]);

  // РЕАГИРУЕМ НА ТРИГЕРЫ
  useEffect(() => {
    if (!triggerDetected) return;

    startCountdown(0, () => setCountdown(0), setCountdown);
    setShowNextButton(false);
    if (triggerDetected === 'repeat') {
      repeatQuastion();
    }
    if (triggerDetected === 'next') {
      nextQuastion();
    }
  }, [triggerDetected]);

  // ========================================================================= ЭФФЕКТЫ КОНЕЦ

  const contextValue = useMemo(
    () => ({
      startInterview,
      step,
    }),
    [startInterview, step]
  );

  const uiValue = useMemo(
    () => ({
      countdown,
      showNextButton,
      saveAnswer,
    }),
    [countdown, saveAnswer, showNextButton]
  );

  if (!isPersistent || !interview) return <Preloader />;

  return (
    <ProgressContext.Provider value={contextValue}>
      <ProgressUiProvider value={uiValue}>{children}</ProgressUiProvider>
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
