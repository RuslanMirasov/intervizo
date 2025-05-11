'use client';

import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const CameraContext = createContext(null);

export const CameraProvider = ({ children }) => {
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
    if (mediaRecorderRef.current) {
      const recorder = mediaRecorderRef.current;
      if (recorder.state === 'recording' || recorder.state === 'paused') {
        recorder.stop();
      }
      mediaRecorderRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
    setCameraStartTime(null);
    setRecordingStartTime(null);
    setIsRecording(false);
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

    mediaRecorderRef.current = recorder;
    recorder.start();
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

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      stopCamera();
    };
  }, [videoUrl, stopCamera]);

  const value = {
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

  return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>;
};

export const useCamera = () => {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera должен использоваться внутри <CameraProvider>');
  }
  return context;
};
