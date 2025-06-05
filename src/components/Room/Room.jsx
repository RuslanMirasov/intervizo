'use client';

import { useInterview } from '@/hooks/useInterview';
import { Camera, RoomButtons, RoomPanel, RoomQuestion } from '@/components';

import css from './Room.module.scss';

const Room = ({ id }) => {
  const { interview, isPersistent } = useInterview();

  if (!isPersistent) return null;

  return (
    <div className={css.Room}>
      <h1>{interview?.name}</h1>

      <div className={css.Camera}>
        <Camera />
        <RoomQuestion interview={interview} />
        <RoomPanel />
      </div>
      <RoomButtons id={id} />
    </div>
  );
};

export default Room;
