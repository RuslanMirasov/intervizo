'use client';

import { useEffect, useRef } from 'react';
import { useProgress } from '@/context/ProgressContext';
import { useInterview } from '@/hooks/useInterview';
import { Camera, RoomButtons, RoomPanel } from '@/components';
import css from './Room.module.scss';

const Room = () => {
  const { interview, isPersistent } = useInterview();
  const { startInterview, stopInterview } = useProgress();

  console.log('%c🧱 Room Component готов', 'color: green');

  useEffect(() => {
    if (isPersistent && interview.data.length > 0) {
      startInterview();
    }
  }, [isPersistent, interview.data, startInterview, stopInterview]);

  if (!isPersistent) return null;

  return (
    <div className={css.Room}>
      <h1>{interview?.name}</h1>

      <div className={css.Camera}>
        <Camera />
        <RoomPanel />
      </div>
      <RoomButtons />
    </div>
  );
};

export default Room;
