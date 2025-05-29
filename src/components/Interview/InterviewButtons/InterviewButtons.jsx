'use client';

import { Button } from '@/components';
import { useInterview } from '@/hooks/useInterview';
import { usePopup } from '@/hooks/usePopup';
import { useEffect } from 'react';
import css from './InterviewButtons.module.scss';

const InterviewButtons = ({ _id, currentInterview }) => {
  const { openPopup } = usePopup();
  const { interview, updates, setInterview, resetInterview, setUpdates } = useInterview();

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
    if (!currentInterview) return;

    const getDiff = (a, b) => {
      const diff = {};

      for (const key in a) {
        // Специальная логика для data
        if (key === 'data' && Array.isArray(a.data) && Array.isArray(b.data)) {
          const changed = [];

          const maxLength = Math.max(a.data.length, b.data.length);

          for (let i = 0; i < maxLength; i++) {
            const itemA = a.data[i];
            const itemB = b.data[i];

            if (!itemA || !itemB || JSON.stringify(itemA) !== JSON.stringify(itemB)) {
              changed.push(itemA);
            }
          }

          if (changed.length > 0) {
            diff.data = changed;
          }

          continue;
        }

        // Глубокое сравнение других объектов
        if (typeof a[key] === 'object' && a[key] !== null && b[key] !== null && !Array.isArray(a[key])) {
          const nestedDiff = getDiff(a[key], b[key]);
          if (Object.keys(nestedDiff).length > 0) {
            diff[key] = nestedDiff;
          }
        } else if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) {
          diff[key] = a[key];
        }
      }

      return diff;
    };

    const diff = getDiff(interview, currentInterview);
    setUpdates(diff);
  }, [interview, currentInterview, setUpdates]);

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
        <Button className="small" disabled={Object.keys(updates).length === 0} onClick={handleUpdateInterview}>
          Обновить
        </Button>
      )}
    </div>
  );
};

export default InterviewButtons;
