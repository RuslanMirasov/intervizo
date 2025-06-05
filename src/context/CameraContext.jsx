'use client';

import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';

const CameraContext = createContext(null);

export const CameraProvider = ({ children }) => {
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null); // основной стрим с видео и микрофоном

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const audioContextRef = useRef(null);
  const audioElementRef = useRef(null);
  const micSourceRef = useRef(null);
  const audioSourceRef = useRef(null);
  const destinationRef = useRef(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [cameraStartTime, setCameraStartTime] = useState(null);
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const isPortrait = window.matchMedia('(orientation: portrait)').matches;
      const height = 330;
      const width = isPortrait ? 168 : 578;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { exact: width },
          height: { exact: height },
          frameRate: { ideal: 12, max: 15 },
        },
        audio: true,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const micSource = audioContext.createMediaStreamSource(stream);
      micSourceRef.current = micSource;

      const destination = audioContext.createMediaStreamDestination();
      destinationRef.current = destination;

      micSource.connect(destination);

      // создаём скрытый <audio> для проигрывания вопросов в запись
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.muted = false;
      audio.controls = false;
      audio.style.display = 'none';
      document.body.appendChild(audio);
      audioElementRef.current = audio;

      const audioSource = audioContext.createMediaElementSource(audio);
      audioSourceRef.current = audioSource;
      audioSource.connect(destination);

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

    if (audioElementRef.current) {
      audioElementRef.current.pause();
      document.body.removeChild(audioElementRef.current);
      audioElementRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setIsCameraOn(false);
    setCameraStartTime(null);
    setRecordingStartTime(null);
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(() => {
    if (!mediaStreamRef.current || !destinationRef.current) return;

    chunksRef.current = [];

    const mixedStream = new MediaStream([
      ...mediaStreamRef.current.getVideoTracks(),
      ...destinationRef.current.stream.getAudioTracks(),
    ]);

    const recorder = new MediaRecorder(mixedStream, {
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

  const stopRecording = useCallback(() => {
    return new Promise(resolve => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return resolve(null);

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoBlob(blob);
        setVideoUrl(url);
        resolve(url);
      };

      recorder.stop();
      setIsRecording(false);
      setRecordingStartTime(null);
    });
  }, []);

  const pauseRecording = useCallback(() => {
    mediaRecorderRef.current?.pause();
  }, []);

  const resumeRecording = useCallback(() => {
    mediaRecorderRef.current?.resume();
  }, []);

  const playQuestionAudio = useCallback(url => {
    return new Promise((resolve, reject) => {
      const audio = audioElementRef.current;
      if (!audio) return reject('Аудио элемент не готов');

      audio.src = url;
      audio.onended = resolve;
      audio.onerror = reject;

      const playPromise = audio.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(reject);
      }
    });
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
    stopRecording,
    pauseRecording,
    resumeRecording,
    playQuestionAudio,
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
