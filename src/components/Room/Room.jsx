'use client';

import { useState, useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Camera, Preloader, Button, Icon } from '@/components';
import css from './Room.module.scss';
import { useProgress } from '@/hooks/useProgress';

const Room = () => {
  const { cameraStartTime, recordingStartTime, videoRef, startCamera, stopCamera, startRecording, error } = useCamera();
  const { interview, stepPhase, countdown, loading, startInterview, finishAnswer } = useProgress();
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

  return (
    <div className={css.Room}>
      <h1>{interview?.name}</h1>

      <div className={css.Camera}>
        <Camera videoRef={videoRef} startCamera={startCamera} stopCamera={stopCamera} error={error} />
        <div className={`${css.Robot} ${loading ? css.Loading : ''}`} onClick={startRecording}>
          <Preloader className={css.RoomPreloader} />
          {stepPhase === 'thinking' && countdown > 0 && countdown < 6 && <div className={css.Counter}>{countdown}</div>}

          <span>InterVizo</span>
        </div>
      </div>
      <div className={css.Panel}>
        <span className={`${css.Time} ${recordingStartTime ? css.Rec : ''}`}>{elapsedTime}</span>
        {stepPhase === 'pause' && !loading && (
          <Button className="small border" onClick={startInterview}>
            Начать интервью
          </Button>
        )}

        {stepPhase === 'answering' && (
          <Button className="small" onClick={finishAnswer}>
            Принять мой ответ
          </Button>
        )}

        {((stepPhase !== 'pause' && stepPhase !== 'answering') || loading) && (
          <Button href="./" className="small call">
            <Icon name="call" size="25" color="var(--white)" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Room;
