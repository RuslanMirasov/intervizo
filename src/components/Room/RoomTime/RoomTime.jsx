'use client';

import { useState, useEffect } from 'react';
import { useCamera } from '@/context/CameraContext';
import css from './RoomTime.module.scss';

const RoomTime = () => {
  const { cameraStartTime, recordingStartTime } = useCamera();
  const [elapsedTime, setElapsedTime] = useState('00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const startTime = recordingStartTime || cameraStartTime;
      if (startTime) {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
        const seconds = String(diff % 60).padStart(2, '0');
        setElapsedTime(`${minutes}:${seconds}`);
      } else {
        setElapsedTime('00:00');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cameraStartTime, recordingStartTime]);

  return <span className={`${css.Time} ${recordingStartTime ? css.Rec : ''}`}>{elapsedTime}</span>;
};

export default RoomTime;
