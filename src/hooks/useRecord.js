'use client';

import { useRef, useCallback } from 'react';


export function useRecord() {
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const setStream = useCallback(stream => {
    streamRef.current = stream;
  }, []);

  const startRecording = useCallback(() => {
    if (!streamRef.current) {
      console.warn('Нет активного микрофона для записи');
      return false;
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
      return true;
    } catch (err) {
      console.error('Ошибка запуска записи:', err);
      return false;
    }
  }, []);


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


  const isRecording = useCallback(() => {
    return mediaRecorderRef.current !== null && mediaRecorderRef.current.state === 'recording';
  }, []);

  return {
    setStream,
    startRecording,
    stopRecording,
    isRecording,
  };
}
