'use client';
import { createContext, useContext } from 'react';
import { useVideo as useVideoLogic } from '@/hooks/useVideo';

const VideoContext = createContext(null);

export const VideoProvider = ({ children }) => {
  const video = useVideoLogic();
  return <VideoContext.Provider value={video}>{children}</VideoContext.Provider>;
};

export const useVideo = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideo must be used within VideoProvider');
  }
  return context;
};
