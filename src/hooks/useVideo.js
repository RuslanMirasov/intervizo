'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useVideo() {
  const [src, setSrc] = useState(null);
  const [visible, setVisible] = useState(false);
  const [loop, setLoop] = useState(false);
  const videoRef = useRef(null);
  const resolveRef = useRef(null);

  const stopVideo = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
    }
    setVisible(false);
    setSrc(null);
    resolveRef.current?.();
    resolveRef.current = null;
  }, []);

  const startVideo = useCallback(url => {
    return new Promise(resolve => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
      // перезапускаем даже тот же самый src
      setSrc(null);
      setTimeout(() => {
        setSrc(url);
        setLoop(true);
        setVisible(true);
        resolveRef.current = resolve;
      }, 50);
    });
  }, []);

  const playVideo = useCallback(url => {
    return new Promise(resolve => {
      setSrc(url);
      setLoop(false);
      setVisible(true);
      resolveRef.current = resolve;
    });
  }, []);

  const onEnded = () => {
    if (!loop) {
      setVisible(false);
      resolveRef.current?.();
      resolveRef.current = null;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    video.currentTime = 0;
    video.play().catch(console.error);
  }, [src]);

  return {
    videoRef,
    src,
    visible,
    loop,
    onEnded,
    startVideo,
    stopVideo,
    playVideo,
  };
}
