'use client';

import { toast } from 'react-toastify';
import { Button, Icon } from '@/components';
import { useInterview } from '@/hooks/useInterview';
import { usePopup } from '@/hooks/usePopup';
import { useEffect } from 'react';
import css from './InterviewButtons.module.scss';

const InterviewButtons = ({ _id, currentInterview = null, mutateCurrentInterview = null }) => {
  const { openPopup, closePopup } = usePopup();
  const { interview, updates, setInterview, resetInterview, setUpdates } = useInterview();

  const handleShere = async () => {
    const interviewId = _id || currentInterview._id;
    if (!interviewId) return;

    const link = `${window.location.origin}/connect?id=${interviewId}`;

    try {
      await navigator.clipboard.writeText(link);
      toast.success('Скопировано в буфер обмена!', {
        icon: <Icon name="ok" size={16} color="#59F928" />,
      });
    } catch (err) {
      toast.error('Что-то пошло не так');
    }
  };

  const handleDeleteInterview = async () => {
    openPopup({
      type: 'confirm',
      title: 'Вы уверены?',
      button: 'Удалить',
      subtitle: `При подтверждении все данные интервью, а\u00A0также все сгенерированные для него медиа ресусры будут безвозвратно удалены.`,
      action: () => {
        closePopup();
        setTimeout(() => {
          openPopup({
            type: 'delete-interview',
            locked: true,
            id: _id || currentInterview._id,
          });
        }, 400);
      },
    });
  };

  const handleSaveInterview = async () => {
    openPopup({
      type: 'save-interview',
      locked: true,
      mutateCurrentInterview,
    });
  };

  const handleUpdateInterview = async () => {
    openPopup({
      type: 'update-interview',
      locked: false,
      id: currentInterview._id,
      mutateCurrentInterview,
    });
  };

  useEffect(() => {
    if (!currentInterview) return;

    const getDiff = (a, b) => {
      const diff = {};

      for (const key in a) {
        if (key === 'data' && Array.isArray(a.data) && Array.isArray(b.data)) {
          const aJson = JSON.stringify(a.data);
          const bJson = JSON.stringify(b.data);

          if (aJson !== bJson) {
            diff.data = a.data; // просто передаём весь массив
          }

          continue;
        }

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
    if (interview._id && !currentInterview && !_id) {
      resetInterview();
    }
  }, [interview._id, currentInterview, _id, resetInterview]);

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
          <Button className="small red" onClick={handleDeleteInterview}>
            Удалить
          </Button>
          <Button className="small shere" onClick={handleShere}>
            Поделиться
          </Button>
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
