'use client';

// import { useEffect } from 'react';
// import { useProgress } from '@/context/ProgressContext';
import { useInterview } from '@/hooks/useInterview';
import { Camera, RoomButtons, RoomPanel, RoomQuestion } from '@/components';
import css from './Room.module.scss';

const Room = () => {
  const { interview, isPersistent } = useInterview();
  // const { startInterview } = useProgress();

  console.log('%c🧱 Room Component готов', 'color: green');

  // useEffect(() => {
  //   if (isPersistent && interview.data.length > 0) {
  //     startInterview();
  //   }
  // }, [isPersistent, interview.data, startInterview]);

  if (!isPersistent) return null;

  return (
    <div className={css.Room}>
      <h1>{interview?.name}</h1>

      <div className={css.Camera}>
        <Camera />
        <RoomQuestion interview={interview} />
        <RoomPanel />
      </div>
      <RoomButtons />
    </div>
  );
};

export default Room;
