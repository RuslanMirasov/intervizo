'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export function useVoice({ threshold = 15 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const intervalRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // 🔊 Только анализ речи (без записи)
  const startListening = useCallback(async () => {
    if (isActive) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;

      const mic = audioContext.createMediaStreamSource(stream);
      mic.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;

      intervalRef.current = setInterval(() => {
        analyser.getByteTimeDomainData(dataArray);
        const isNowSpeaking = dataArray.some(v => Math.abs(v - 128) > threshold);
        setIsSpeaking(isNowSpeaking);
      }, 200);

      setIsActive(true);
    } catch (err) {
      console.error('Ошибка доступа к микрофону', err);
    }
  }, [threshold, isActive]);

  // ⏺️ Отдельно начать запись (если стрим уже есть)
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

  // ⏹️ Остановить только запись и вернуть blob
  const stopRecording = useCallback(() => {
    return new Promise(resolve => {
      if (!mediaRecorderRef.current) return resolve(null);

      const recorder = mediaRecorderRef.current;

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        resolve(blob);
      };

      if (recorder.state === 'recording') {
        recorder.stop();
      } else {
        resolve(null);
      }
    });
  }, []);

  // 🛑 Полная остановка микрофона + анализатора
  const stopListening = useCallback(() => {
    if (!isActive) return;

    if (intervalRef.current) clearInterval(intervalRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    intervalRef.current = null;
    audioContextRef.current = null;
    streamRef.current = null;
    analyserRef.current = null;
    dataArrayRef.current = null;
    setIsSpeaking(false);
    setIsActive(false);
  }, [isActive]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isSpeaking,
    isActive,
    startListening, // только анализ речи
    stopListening, // остановка всего
    startRecording, // включение записи (при active микрофоне)
    stopRecording, // завершение записи и получение blob
  };
}
