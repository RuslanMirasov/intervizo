'use client';

import { Button } from '@/components';
import { useInterview } from '@/hooks/useInterview';
import { usePopup } from '@/hooks/usePopup';
import { useEffect } from 'react';
import css from './InterviewButtons.module.scss';

const InterviewButtons = ({ _id, currentInterview }) => {
  const { openPopup } = usePopup();
  const { interview, setInterview, resetInterview } = useInterview();

  const handleSaveInterview = async () => {
    openPopup({
      type: 'save-interview',
      locked: true,
    });
  };

  const handleUpdateInterview = async () => {
    openPopup({
      type: 'update-interview',
      locked: false,
    });
  };

  useEffect(() => {
    if (interview._id && !currentInterview) {
      resetInterview();
    }
  }, [interview._id, currentInterview, resetInterview]);

  useEffect(() => {
    if (currentInterview) {
      setInterview(currentInterview);
    }
  }, [currentInterview, setInterview]);

  if (!interview) return null;

  return (
    <div className={css.InterviewButtons}>
      {(_id || currentInterview?._id) && (
        <>
          <Button className="small red">Удалить</Button>
          <Button className="small shere">Поделиться</Button>
        </>
      )}

      {_id && (
        <Button href={`/add-new-interview?id=${_id}`} className="small border">
          Редактировать
        </Button>
      )}

      {!_id && !currentInterview?._id && (
        <Button className="small" disabled={interview?.data?.length <= 0} onClick={handleSaveInterview}>
          Сохранить
        </Button>
      )}

      {currentInterview?._id && (
        <Button className="small" disabled={interview?.data?.length <= 0} onClick={handleUpdateInterview}>
          Обновить
        </Button>
      )}
    </div>
  );
};

export default InterviewButtons;
