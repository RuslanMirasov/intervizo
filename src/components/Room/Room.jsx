'use client';

import { useState, useEffect } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { useCamera } from '@/hooks/useCamera';
import { Camera, Preloader, InterviewRunner } from '@/components';
import css from './Room.module.scss';

const Room = () => {
  const { interview } = useInterview();
  const { cameraStartTime, recordingStartTime, videoRef, startCamera, stopCamera, startRecording, error } = useCamera();
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

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

  return (
    <div className={css.Room}>
      <h1>{interview?.name}</h1>

      <div className={css.Camera}>
        <Camera videoRef={videoRef} startCamera={startCamera} stopCamera={stopCamera} error={error} />
        <div className={`${css.Robot} ${loading ? css.Loading : ''}`} onClick={startRecording}>
          <Preloader className={css.RoomPreloader} />
          {count > 0 && <div className={css.Counter}>{count}</div>}

          <span>InterVizo</span>
        </div>
      </div>
      <div className={css.Panel}>
        <span className={`${css.Time} ${recordingStartTime ? css.Rec : ''}`}>{elapsedTime}</span>
        <InterviewRunner interview={interview} loading={loading} setLoading={setLoading} setCount={setCount} />
      </div>
    </div>
  );
};

export default Room;
