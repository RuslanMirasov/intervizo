'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useVoice({
  // Порог чувствительности: 10-15 для тихих помещений, 20-25 для шумных
  threshold = 15,
  // Интервал проверки аудио в мс
  checkInterval = 100,
  // Язык распознавания речи
  lang = 'ru-RU',
  // Триггеры для повтора вопроса
  repeatTriggers = [
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
  ],
  // Триггеры для следующего вопроса
  nextTriggers = [
    'следующий вопрос',
    'к следующему вопросу',
    'пропустить вопрос',
    'вопрос пропустить',
    'пропустить вопрос',
  ],
} = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [triggerDetected, setTriggerDetected] = useState(null);

  // Ссылки для аудио-анализа
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const intervalRef = useRef(null);

  // Ссылки для записи
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Ссылка для распознавания речи
  const recognitionRef = useRef(null);
  const isActiveRef = useRef(false);

  // Запуск прослушивания микрофона и распознавания речи
  const startListening = useCallback(async () => {
    if (isActiveRef.current) return;
    isActiveRef.current = true;

    try {
      // 1. Инициализация микрофона для определения речи
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Настройка аудио-анализатора
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 1024;

      const mic = audioContext.createMediaStreamSource(stream);
      mic.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      // Запуск интервала для определения наличия речи
      intervalRef.current = setInterval(() => {
        analyser.getByteTimeDomainData(dataArray);

        let voiceDetected = 0;
        const minSamples = 5;

        for (let i = 0; i < dataArray.length; i++) {
          if (Math.abs(dataArray[i] - 128) > threshold) {
            voiceDetected++;
            if (voiceDetected >= minSamples) break;
          }
        }

        setIsSpeaking(voiceDetected >= minSamples);
      }, checkInterval);

      // 2. Инициализация распознавания речи
      if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        console.error('Распознавание речи не поддерживается в этом браузере');
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = event => {
        let transcript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript.toLowerCase();
        }

        // Проверяем триггеры
        if (repeatTriggers.some(phrase => transcript.includes(phrase))) {
          setTriggerDetected('repeat');
          stopListening();
        } else if (nextTriggers.some(phrase => transcript.includes(phrase))) {
          setTriggerDetected('next');
          stopListening();
        }
      };

      recognition.onerror = event => {
        console.warn('Ошибка распознавания речи:', event.error);

        // Перезапускаем распознавание при ошибке, если всё ещё активно
        if (isActiveRef.current && event.error === 'no-speech') {
          try {
            recognition.stop();
            setTimeout(() => {
              if (isActiveRef.current) recognition.start();
            }, 100);
          } catch (err) {
            console.error('Ошибка перезапуска распознавания:', err);
          }
        }
      };

      recognition.onend = () => {
        // Перезапускаем распознавание, если оно всё ещё должно быть активно
        if (isActiveRef.current) {
          try {
            setTimeout(() => {
              if (isActiveRef.current) recognition.start();
            }, 100);
          } catch (err) {
            console.error('Ошибка перезапуска распознавания:', err);
          }
        }
      };

      recognitionRef.current = recognition;

      // Запускаем распознавание речи
      recognition.start();
    } catch (err) {
      console.error('Ошибка запуска прослушивания:', err);
      isActiveRef.current = false;
    }
  }, [threshold, checkInterval, lang, repeatTriggers, nextTriggers]);

  // Начало записи аудио
  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      console.warn('Нет активного микрофона для записи');
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      console.error('Ошибка запуска записи:', err);
    }
  }, []);

  // Остановка записи и получение аудио-блоба
  const stopRecording = useCallback(() => {
    return new Promise(resolve => {
      if (!mediaRecorderRef.current) return resolve(null);

      const recorder = mediaRecorderRef.current;

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        mediaRecorderRef.current = null;
        resolve(blob);
      };

      if (recorder.state === 'recording') {
        recorder.stop();
      } else {
        resolve(null);
      }
    });
  }, []);

  // Остановка прослушивания и освобождение ресурсов
  const stopListening = useCallback(() => {
    if (!isActiveRef.current) return;
    isActiveRef.current = false;

    // Останавливаем распознавание речи
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Ошибка остановки распознавания речи:', err);
      }
      recognitionRef.current = null;
    }

    // Очищаем интервал
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Закрываем аудио-контекст
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Останавливаем все треки
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Сбрасываем ссылки и состояния
    analyserRef.current = null;
    dataArrayRef.current = null;
    setIsSpeaking(false);
    setTriggerDetected(null);
  }, []);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isSpeaking,
    triggerDetected,
    setTriggerDetected,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
  };
}
