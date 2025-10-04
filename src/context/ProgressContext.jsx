'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import useLocalStorageState from 'use-local-storage-state';

//import { useVoice } from '@/hooks/useVoice';
import { useWhisperVoice } from '@/hooks/useWhisperVoice';

import { useProgressStorage } from '@/hooks/useProgressStorage';
import { startCountdown } from '@/lib/startCountdown';
import { getRandomItemFromArray } from '@/lib/getRandomItemFromArray';
import { transcribeVoice } from '@/lib/transcribeVoice';
import { playAudio } from '@/lib/playAudio';
import { saveAudio } from '@/lib/save';
import { speak } from '@/lib/speak';
import { speakInBrowser } from '@/lib/speakInBrowser';
import { preloadMedia } from '@/lib/preloadMedia';
import { ProgressUiProvider } from './ProgressUiContext';
import { Preloader } from '@/components';
import { useVideo } from '@/context/VideoContext';
import { useCamera } from '@/context/CameraContext';

const ProgressContext = createContext(null);

export const ProgressProvider = ({ children }) => {
  const router = useRouter();
  const [interview, , { isPersistent }] = useLocalStorageState('interview');

  // const { isSpeaking, triggerDetected, startRecord, stopRecord, pauseRecord, resumeRecord } = useVoice();
  const { isSpeaking, triggerDetected, startRecord, stopRecord, pauseRecord, resumeRecord, connect, disconnect } =
    useWhisperVoice();

  const { addQuestion, updateAnswer } = useProgressStorage();

  const video = useVideo();

  const [step, setStep] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [countdown, setCountdown] = useState(null);

  const transcriptionPromises = useRef([]);
  const lastStepRef = useRef(null);

  const { startCamera, stopCamera, startRecording, stopRecording, videoUrl, playQuestionAudio } = useCamera();

  // ЗАПУСКАЕМ ИНТЕРВЬЮ

  const startInterview = useCallback(async () => {
    if (interview?.data?.length > 0) {
      await connect();

      const allQuestionsAudioUrls = interview.data.map(url => url.audio);
      const prelodeElementsArr = [...allQuestionsAudioUrls];
      await preloadMedia(prelodeElementsArr);
      setStep(0);
    }
  }, [interview, connect]);

  const finishInterview = useCallback(async () => {
    // await Promise.allSettled(transcriptionPromises.current);

    disconnect();
    router.push('/scoring');
  }, [router, disconnect]);

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

      //await speakInBrowser(text);
      //await speak(text, '/api/speak-eleven');
      //await playAudio(audio);
      //await saveAudio(text, { filename: 'repeat.mp3', voice: 'onyx' }); //nova

      //--------------------------------------------

      await new Promise(r => setTimeout(r, 800));

      video.startVideo('/video/speak.mp4');
      await playAudio(audio);
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
      } else {
        await startRecord();
      }

      startCountdown(30, () => saveAnswer(), setCountdown);
    },
    [interview]
  );

  // const transcribeAnswer = async (id, blob) => {
  //   console.log('Я транскрибирую BLOB: ', blob);
  //   const transcriptionPromise = transcribeVoice(blob)
  //     .then(transcription => {
  //       updateAnswer(id, transcription);
  //       return { id, transcription, success: true };
  //     })
  //     .catch(error => {
  //       return { id, transcription: null, success: false, error };
  //     });

  //   transcriptionPromises.current.push(transcriptionPromise);
  //   return transcriptionPromise;
  // };

  const saveAnswer = async (isNext = true) => {
    await startCountdown(0, () => setCountdown(0), setCountdown);
    await setShowNextButton(false);
    // const recordedBlob = await stopRecord();

    // if (recordedBlob) {
    //   transcribeAnswer(step, recordedBlob);
    // }

    const transcription = await stopRecord();

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
    }),
    [startInterview, step, video]
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
