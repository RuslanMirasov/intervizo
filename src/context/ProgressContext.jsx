'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import { useWhisperVoice } from '@/hooks/useWhisperVoice';
import { useProgressStorage } from '@/hooks/useProgressStorage';
import { startCountdown } from '@/lib/startCountdown';
import { getRandomItemFromArray } from '@/lib/getRandomItemFromArray';
import { preloadMedia } from '@/lib/preloadMedia';
import { ProgressUiProvider } from './ProgressUiContext';
import { Preloader } from '@/components';
import { useVideo } from '@/context/VideoContext';
import { useCamera } from '@/context/CameraContext';

const ProgressContext = createContext(null);

export const ProgressProvider = ({ children }) => {
  const router = useRouter();
  const [interview, , { isPersistent }] = useLocalStorageState('interview');
  const {
    isSpeaking,
    triggerDetected,
    setTriggerDetected,
    startRecord,
    stopRecord,
    pauseRecord,
    resumeRecord,
    connect,
    disconnect,
  } = useWhisperVoice();
  const { addQuestion, updateAnswer } = useProgressStorage();
  const video = useVideo();
  const [step, setStep] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const lastStepRef = useRef(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState(null);
  const { isCameraOn, startRecording, stopRecording, isRecording, playQuestionAudio } = useCamera();

  // ЗАПУСКАЕМ ИНТЕРВЬЮ

  const startInterview = useCallback(async () => {
    if (interview?.data?.length > 0) {
      const allQuestionsAudioUrls = interview.data.map(url => url.audio);
      const prelodeElementsArr = [...allQuestionsAudioUrls];

      await preloadMedia(prelodeElementsArr);
      setStep(0);
    }
  }, [interview]);

  const finishInterview = useCallback(async () => {
    try {
      await stopRecording?.();
    } finally {
      router.push('/scoring');
    }
  }, [router, stopRecording]);

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

  const goToStep = useCallback(
    async (number, isRepeat = false) => {
      const stepData = interview?.data?.[number];
      if (!stepData) return;

      const { text, type, audio } = stepData;

      //--------------------------------------------

      await new Promise(r => setTimeout(r, 800));

      if (!isRepeat) {
        await connect();
      }

      video.startVideo('/video/speak.mp4');
      await playQuestionAudio(audio);

      await video.stopVideo();

      // ---------------------------------------------

      if (type === 'message') {
        setShowNextButton(false);
        goToNextStep();
        return;
      }

      addQuestion({ id: number, question: text });

      if (isRepeat) {
        await resumeRecord();
        await setTriggerDetected(null);
      } else {
        await startRecord();
      }

      startCountdown(30, () => saveAnswer(), setCountdown);
    },
    [interview]
  );

  const saveAnswer = async (isNext = true) => {
    console.log('Сохранение результатов');
    await startCountdown(0, () => setCountdown(0), setCountdown);
    await setShowNextButton(false);

    const transcription = await stopRecord();
    await disconnect();

    if (transcription) {
      updateAnswer(step, transcription);
    }

    const isLast = interview?.data && step + 1 >= interview.data.length - 1;

    if (isNext && !isLast) {
      await new Promise(r => setTimeout(r, 300));
      const confirmVideo = getRandomItemFromArray([
        '/video/confirm1.mp4',
        '/video/confirm2.mp4',
        '/video/confirm3.mp4',
        '/video/confirm4.mp4',
        '/video/confirm5.mp4',
        '/video/confirm6.mp4',
        '/video/confirm7.mp4',
      ]);
      await video.playVideo(confirmVideo);
    }
    goToNextStep();
  };

  const repeatQuastion = async () => {
    console.log('Повтор вопроса сработала функция repeatQuastion()');
    await pauseRecord();
    const repeatVideo = getRandomItemFromArray(['/video/repeat1.mp4', '/video/repeat2.mp4', '/video/repeat3.mp4']);
    await new Promise(r => setTimeout(r, 200));
    await video.playVideo(repeatVideo);
    goToStep(step, true);
  };

  const nextQuastion = async () => {
    const isLast = interview?.data && step + 1 >= interview.data.length - 1;

    if (!isLast) {
      const nextQuestionVideo = getRandomItemFromArray(['/video/next1.mp4', '/video/next2.mp4', '/video/next3.mp4']);
      await new Promise(r => setTimeout(r, 200));
      await video.playVideo(nextQuestionVideo);
    }

    saveAnswer(false);
  };
  // ========================================================================= ЭФФЕКТЫ

  // ЭФФЕКТ ЗАПУСКАЕТ ПЕРВЫЙ ШАГ ПРИ ЗАГРУЗКЕ
  useEffect(() => {
    if (isPersistent && interview && interview.data?.length > 0) {
      startInterview();
    }
  }, [isPersistent, interview]);

  // как только step=0 и камера включена — стартуем видео запись
  useEffect(() => {
    if (step === 0 && isCameraOn && !isRecording) {
      try {
        startRecording();
      } catch {}
    }
  }, [step, isCameraOn, isRecording, startRecording]);

  //ЭФФЕКТ ЗАПУСКАЕТ СЛЕДУЮЩИЙ ШАГ ПРИ ИЗМЕНЕНИИ STEP
  useEffect(() => {
    if (step === null || !interview?.data || !interview.data[step]) return;

    if (lastStepRef.current === step) return;
    lastStepRef.current = step;

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
      startVideo: video.startVideo,
      stopVideo: video.stopVideo,
      playVideo: video.playVideo,
      finalVideoUrl,
    }),
    [startInterview, step, video, finalVideoUrl]
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

  if (finalVideoUrl) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Готовое видео</h2>
        <p>
          <a href={finalVideoUrl} download="interview.webm">
            Скачать файл
          </a>
        </p>
        <video src={finalVideoUrl} controls playsInline style={{ width: '100%', maxWidth: 640 }} />
      </div>
    );
  }

  return (
    <ProgressContext.Provider value={contextValue}>
      <ProgressUiProvider value={uiValue}>{children}</ProgressUiProvider>
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);
