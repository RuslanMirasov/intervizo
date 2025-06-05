'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const AUDIO_CONFIG = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

const ANALYSER_CONFIG = {
  fftSize: 1024,
  minSamples: 5,
  volumeThreshold: 128,
};

const SPEECH_CONFIG = {
  continuous: true,
  interimResults: true,
  restartDelay: 100,
};

const AUDIO_FORMAT = 'audio/webm';

const DEFAULT_REPEAT_TRIGGERS = [
  'повторите вопрос',
  'повтори вопрос',
  'вопрос ещё раз',
  'вопрос повторить',
  'повторите пожалуйста вопрос',
  'повторить вопрос',
  'можно ещё раз вопрос',
  'не расслышал вопрос',
  'что вы сказали',
  'не понял вопрос',
  'можно повтор',
  'ещё раз пожалуйста',
  'скажите ещё раз',
  'повторите пожалуйста',
  'повторить пожалуйста',
];

const DEFAULT_NEXT_TRIGGERS = ['следующий вопрос', 'к следующему вопросу', 'пропустить вопрос', 'вопрос пропустить'];

export function useVoice({
  threshold = 15,
  checkInterval = 100,
  lang = 'ru-RU',
  repeatTriggers = DEFAULT_REPEAT_TRIGGERS,
  nextTriggers = DEFAULT_NEXT_TRIGGERS,
} = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [triggerDetected, setTriggerDetected] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const audioRefs = useRef({
    stream: null,
    context: null,
    analyser: null,
    dataArray: null,
    detectionInterval: null,
  });

  const recordingRefs = useRef({
    mediaRecorder: null,
    chunks: [],
    lastBlob: null,
  });

  const speechRefs = useRef({
    recognition: null,
    isActive: false,
    isPaused: false,
    hadTranscript: false,
  });

  const isMountedRef = useRef(true);

  const cleanupAudioResources = useCallback(() => {
    const { stream, context, detectionInterval } = audioRefs.current;

    if (detectionInterval) {
      clearInterval(detectionInterval);
      audioRefs.current.detectionInterval = null;
    }

    if (context && context.state !== 'closed') {
      try {
        context.close();
      } catch (error) {
        console.error('Audio context cleanup error:', error);
      }
    }

    if (stream) {
      try {
        stream.getTracks().forEach(track => {
          if (track.readyState !== 'ended') {
            track.stop();
          }
        });
      } catch (error) {
        console.error('Stream cleanup error:', error);
      }
    }

    audioRefs.current = {
      stream: null,
      context: null,
      analyser: null,
      dataArray: null,
      detectionInterval: null,
    };
  }, []);

  const cleanupRecordingResources = useCallback(() => {
    const { mediaRecorder } = recordingRefs.current;

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
      } catch (error) {
        console.error('MediaRecorder cleanup error:', error);
      }
    }

    recordingRefs.current.mediaRecorder = null;
    recordingRefs.current.chunks = [];
  }, []);

  const cleanupSpeechResources = useCallback(() => {
    const { recognition } = speechRefs.current;

    if (recognition) {
      try {
        recognition.stop();
      } catch (error) {
        console.error('Speech recognition cleanup error:', error);
      }
    }

    speechRefs.current.recognition = null;
  }, []);

  const cleanupAllResources = useCallback(() => {
    cleanupSpeechResources();
    cleanupRecordingResources();
    cleanupAudioResources();

    speechRefs.current.isActive = false;
    speechRefs.current.isPaused = false;

    if (isMountedRef.current) {
      setIsSpeaking(false);
      setTriggerDetected(null);
    }
  }, [cleanupAudioResources, cleanupRecordingResources, cleanupSpeechResources]);

  const initializeAudio = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONFIG });
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = ANALYSER_CONFIG.fftSize;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);

      audioRefs.current = {
        ...audioRefs.current,
        stream,
        context: audioContext,
        analyser,
        dataArray,
      };

      return true;
    } catch (error) {
      console.error('Audio initialization error:', error);
      return false;
    }
  }, []);

  const startVoiceDetection = useCallback(() => {
    const { analyser, dataArray, detectionInterval } = audioRefs.current;

    if (detectionInterval || !analyser || !dataArray) return;

    audioRefs.current.detectionInterval = setInterval(() => {
      const { analyser: currentAnalyser, dataArray: currentDataArray } = audioRefs.current;

      if (!currentAnalyser || !currentDataArray) return;

      currentAnalyser.getByteTimeDomainData(currentDataArray);

      let voiceDetected = 0;
      const { minSamples, volumeThreshold } = ANALYSER_CONFIG;

      for (let i = 0; i < currentDataArray.length; i++) {
        if (Math.abs(currentDataArray[i] - volumeThreshold) > threshold) {
          voiceDetected++;
          if (voiceDetected >= minSamples) break;
        }
      }

      setIsSpeaking(voiceDetected >= minSamples);
    }, checkInterval);
  }, [threshold, checkInterval]);

  const stopVoiceDetection = useCallback(() => {
    const { detectionInterval } = audioRefs.current;

    if (detectionInterval) {
      clearInterval(detectionInterval);
      audioRefs.current.detectionInterval = null;
    }

    setIsSpeaking(false);
  }, []);

  const handleSpeechResult = useCallback(
    event => {
      if (speechRefs.current.isPaused) return;

      // let transcript = '';
      // for (let i = event.resultIndex; i < event.results.length; i++) {
      //   transcript += event.results[i][0].transcript.toLowerCase();
      // }

      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const partial = event.results[i][0].transcript.trim().toLowerCase();

        // Строгая проверка: минимум 2 слова и хотя бы одно из них длиной >= 4
        const words = partial.split(/\s+/).filter(Boolean);
        const hasEnoughWords = words.length >= 2;
        const hasLongWord = words.some(word => word.length >= 4);

        if (hasEnoughWords && hasLongWord) {
          transcript += partial;
          speechRefs.current.hadTranscript = true;
          console.log('✔ речевая фраза:', partial);
        } else {
          console.log('✘ игнор:', partial);
        }
      }

      const isRepeatTrigger = repeatTriggers.some(phrase => transcript.includes(phrase));
      const isNextTrigger = nextTriggers.some(phrase => transcript.includes(phrase));

      if (isRepeatTrigger) {
        setTriggerDetected('repeat');
        pauseRecord();
      } else if (isNextTrigger) {
        setTriggerDetected('next');
        stopRecord();
      }
    },
    [repeatTriggers, nextTriggers]
  );

  const restartRecognition = useCallback(() => {
    setTimeout(() => {
      const { isActive, isPaused } = speechRefs.current;
      const { recognition } = speechRefs.current;

      if (isActive && !isPaused && recognition?.state === 'inactive') {
        try {
          recognition.start();
        } catch (error) {
          console.error('Recognition restart error:', error);
        }
      }
    }, SPEECH_CONFIG.restartDelay);
  }, []);

  const handleSpeechError = useCallback(
    event => {
      const { isActive, isPaused } = speechRefs.current;
      const { recognition } = speechRefs.current;

      if (isActive && event.error === 'no-speech' && !isPaused && recognition) {
        try {
          if (recognition.state !== 'inactive') {
            recognition.stop();
          }
          restartRecognition();
        } catch (error) {
          console.error('Speech error handling error:', error);
        }
      }
    },
    [restartRecognition]
  );

  const handleSpeechEnd = useCallback(() => {
    const { isActive, isPaused } = speechRefs.current;
    const { recognition } = speechRefs.current;

    if (isActive && !isPaused && recognition) {
      restartRecognition();
    }
  }, [restartRecognition]);

  const initializeSpeechRecognition = useCallback(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    Object.assign(recognition, { ...SPEECH_CONFIG, lang });

    recognition.onresult = handleSpeechResult;
    recognition.onerror = handleSpeechError;
    recognition.onend = handleSpeechEnd;

    speechRefs.current.recognition = recognition;
    return true;
  }, [lang, handleSpeechResult, handleSpeechError, handleSpeechEnd]);

  const isSilentBlob = async blob => {
    if (!blob || blob.size === 0) return true;

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const data = audioBuffer.getChannelData(0);

      const rms = Math.sqrt(data.reduce((sum, sample) => sum + sample * sample, 0) / data.length);

      return rms < 0.01;
    } catch (e) {
      console.warn('Ошибка анализа аудио на тишину', e);
      return false;
    }
  };

  const createAudioBlob = useCallback(() => {
    const { chunks } = recordingRefs.current;

    if (chunks.length === 0) return null;

    const blob = new Blob(chunks, { type: AUDIO_FORMAT });
    recordingRefs.current.lastBlob = blob;
    recordingRefs.current.chunks = [];

    return blob;
  }, []);

  const startRecord = useCallback(async () => {
    if (speechRefs.current.isActive) return;

    recordingRefs.current.lastBlob = null;
    speechRefs.current.isPaused = false;

    const audioInitialized = await initializeAudio();
    if (!audioInitialized) return;

    const speechInitialized = initializeSpeechRecognition();
    if (!speechInitialized) return;

    try {
      const mediaRecorder = new MediaRecorder(audioRefs.current.stream);
      recordingRefs.current.chunks = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordingRefs.current.chunks.push(event.data);
        }
      };

      mediaRecorder.start();
      recordingRefs.current.mediaRecorder = mediaRecorder;

      startVoiceDetection();
      speechRefs.current.recognition.start();

      speechRefs.current.isActive = true;
      setIsRecording(true);
      setIsPaused(false);
      setTriggerDetected(null);
    } catch (error) {
      console.error('Recording start error:', error);
      speechRefs.current.isActive = false;
      cleanupAllResources();
    }
  }, [initializeAudio, initializeSpeechRecognition, startVoiceDetection, cleanupAllResources]);

  const stopRecord = useCallback(() => {
    if (!speechRefs.current.isActive) {
      return Promise.resolve(recordingRefs.current.lastBlob);
    }

    return new Promise(resolve => {
      speechRefs.current.isActive = false;
      speechRefs.current.isPaused = false;
      setIsRecording(false);
      setIsPaused(false);
      setTriggerDetected(null);

      cleanupSpeechResources();
      stopVoiceDetection();

      const { mediaRecorder } = recordingRefs.current;

      if (mediaRecorder && (mediaRecorder.state === 'recording' || mediaRecorder.state === 'paused')) {
        mediaRecorder.onstop = async () => {
          const blob = createAudioBlob();
          const silent = await isSilentBlob(blob);
          const hadSpeech = speechRefs.current.hadTranscript;
          speechRefs.current.hadTranscript = false;

          cleanupAllResources();
          resolve(!hadSpeech || silent ? null : blob);
        };
        mediaRecorder.stop();
      } else {
        (async () => {
          const blob = createAudioBlob();
          const silent = await isSilentBlob(blob);
          const hadSpeech = speechRefs.current.hadTranscript;
          speechRefs.current.hadTranscript = false;

          cleanupAllResources();
          resolve(!hadSpeech || silent ? null : blob);
        })();
      }
    });
  }, [cleanupSpeechResources, stopVoiceDetection, createAudioBlob, cleanupAllResources]);

  const pauseRecord = useCallback(() => {
    const { isActive, isPaused } = speechRefs.current;

    if (!isActive || isPaused) return;

    speechRefs.current.isPaused = true;
    setIsPaused(true);
    setIsSpeaking(false);

    cleanupSpeechResources();
    stopVoiceDetection();

    const { mediaRecorder } = recordingRefs.current;
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.pause();
    }
  }, [cleanupSpeechResources, stopVoiceDetection]);

  const resumeRecord = useCallback(() => {
    if (!speechRefs.current.isActive) return;

    speechRefs.current.isPaused = false;
    setIsPaused(false);
    setTriggerDetected(null);
    setIsSpeaking(false);

    const { mediaRecorder } = recordingRefs.current;
    if (mediaRecorder?.state === 'paused') {
      mediaRecorder.resume();
    }

    startVoiceDetection();

    const speechInitialized = initializeSpeechRecognition();
    if (speechInitialized && speechRefs.current.recognition) {
      try {
        speechRefs.current.recognition.start();
      } catch (error) {
        console.error('Speech recognition resume error:', error);
      }
    }
  }, [startVoiceDetection, initializeSpeechRecognition]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      isMountedRef.current = false;
      cleanupAllResources();
    };

    const handleVisibilityChange = () => {
      if (document.hidden && speechRefs.current.isActive) {
        isMountedRef.current = false;
        cleanupAllResources();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupAllResources();
    };
  }, [cleanupAllResources]);

  return {
    isSpeaking,
    triggerDetected,
    isRecording,
    isPaused,
    startRecord,
    stopRecord,
    pauseRecord,
    resumeRecord,
  };
}
