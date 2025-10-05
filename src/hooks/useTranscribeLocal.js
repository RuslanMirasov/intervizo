'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Хук для записи аудио и транскрипции с использованием Web Speech API
 * @returns {Object} Методы и состояния для транскрипции
 */
export function useTranscribeLocal() {
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Ссылки для записи аудио
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  /**
   * Установка аудио-потока для записи
   * @param {MediaStream} stream - Поток с микрофона
   */
  const setStream = useCallback(stream => {
    streamRef.current = stream;
  }, []);

  /**
   * Начать запись аудио
   */
  const startTranscription = useCallback(() => {
    if (!streamRef.current || mediaRecorderRef.current) return;

    // Сбрасываем предыдущую транскрипцию
    setTranscription('');
    audioChunksRef.current = [];

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100); // Собираем данные каждые 100мс
      mediaRecorderRef.current = mediaRecorder;
    } catch (err) {
      console.error('Ошибка запуска записи аудио:', err);
    }
  }, []);

  /**
   * Остановить запись и транскрибировать аудио
   * @returns {Promise<string>} Результат транскрипции
   */
  const stopTranscription = useCallback(() => {
    return new Promise(resolve => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== 'recording') {
        resolve(transcription);
        return;
      }

      mediaRecorderRef.current.onstop = async () => {
        try {
          if (audioChunksRef.current.length === 0) {
            resolve('');
            return;
          }

          setIsTranscribing(true);

          // Создаем аудио-блоб из записанных чанков
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          // Используем Web Speech API для транскрипции
          const result = await transcribeAudioWithWebSpeech(audioBlob);

          setTranscription(result);
          setIsTranscribing(false);

          resolve(result);
        } catch (err) {
          console.error('Ошибка при транскрипции:', err);
          setIsTranscribing(false);
          resolve('');
        }
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    });
  }, [transcription]);

  /**
   * Транскрибировать аудио с помощью Web Speech API
   * @param {Blob} audioBlob - Аудио-блоб для транскрипции
   * @returns {Promise<string>} Результат транскрипции
   */
  const transcribeAudioWithWebSpeech = audioBlob => {
    return new Promise(resolve => {
      // Создаем аудио-элемент для воспроизведения записи
      const audioURL = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioURL);

      // Создаем распознаватель речи
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        console.error('Распознавание речи не поддерживается в этом браузере');
        alert('Распознавание речи не поддерживается в этом браузере');
        resolve('');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.continuous = true;
      recognition.interimResults = false;

      let finalTranscript = '';

      recognition.onresult = event => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
      };

      recognition.onerror = event => {
        console.warn('Ошибка распознавания речи:', event.error);
        if (event.error !== 'no-speech') {
          audio.pause();
          recognition.stop();
          resolve(finalTranscript.trim());
        }
      };

      recognition.onend = () => {
        // Если аудио еще воспроизводится, перезапускаем распознавание
        if (!audio.ended && !audio.paused) {
          try {
            recognition.start();
          } catch (err) {
            console.error('Ошибка перезапуска распознавания:', err);
          }
        } else {
          resolve(finalTranscript.trim());
        }
      };

      // Запускаем воспроизведение и распознавание
      audio.onplay = () => {
        try {
          recognition.start();
        } catch (err) {
          console.error('Ошибка запуска распознавания:', err);
        }
      };

      audio.onended = () => {
        try {
          recognition.stop();
        } catch (err) {
          console.error('Ошибка остановки распознавания:', err);
        }
        URL.revokeObjectURL(audioURL);
      };

      audio.play().catch(err => {
        console.error('Ошибка воспроизведения аудио:', err);
        resolve('');
      });
    });
  };

  /**
   * Сбросить текущую транскрипцию
   */
  const resetTranscription = useCallback(() => {
    setTranscription('');
  }, []);

  return {
    transcription,
    isTranscribing,
    startTranscription,
    stopTranscription,
    resetTranscription,
    setStream,
  };
}
