'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export const useCamera = () => {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [error, setError] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [cameraStartTime, setCameraStartTime] = useState(null);
  const [recordingStartTime, setRecordingStartTime] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 800 },
          height: { ideal: 600 },
          frameRate: { ideal: 15, max: 15 },
        },
        audio: true,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOn(true);
      setCameraStartTime(Date.now());
    } catch (err) {
      console.error('Ошибка запуска камеры:', err);
      setError(err.message);
    }
  }, []);

  const stopCamera = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && (recorder.state === 'recording' || recorder.state === 'paused')) {
      recorder.stop();
      setIsRecording(false);
      setRecordingStartTime(null);
    }

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setCameraStartTime(null);
    setRecordingStartTime(null);
  }, []);

  const startRecording = useCallback(() => {
    if (!mediaStreamRef.current) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(mediaStreamRef.current, {
      mimeType: 'video/webm; codecs=vp8',
    });

    recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
    setRecordingStartTime(Date.now());
  }, []);

  const pauseRecording = useCallback(() => {
    mediaRecorderRef.current?.pause();
  }, []);

  const resumeRecording = useCallback(() => {
    mediaRecorderRef.current?.resume();
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setRecordingStartTime(null);
  }, []);

  // Очистка URL
  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      stopCamera();
    };
  }, [videoUrl, stopCamera]);

  return {
    videoRef,
    isCameraOn,
    isRecording,
    videoBlob,
    videoUrl,
    error,
    cameraStartTime,
    recordingStartTime,
    startCamera,
    stopCamera,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
};
