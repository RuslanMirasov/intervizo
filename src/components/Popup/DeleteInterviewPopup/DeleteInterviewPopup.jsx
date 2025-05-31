'use client';

import { useState, useEffect } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { usePopup } from '@/hooks/usePopup';
import { ProgressBar } from '@/components';
import useRequest from '@/hooks/useRequest';
import css from './DeleteInterviewPopup.module.scss';
import { useRouter } from 'next/navigation';

const DeleteInterviewPopup = ({ params }) => {
  const { id } = params;
  const router = useRouter();
  const [progressItems, setProgressItems] = useState([]);
  const percent =
    progressItems.length > 0
      ? Math.round(
          (progressItems.filter(item => item.status === 'fullfield' || item.status === 'rejected').length /
            progressItems.length) *
            100
        )
      : 0;

  const [isRunning, setIsRunning] = useState(false);
  const { closePopup } = usePopup();
  const { resetUpdates, resetInterview } = useInterview();

  const { trigger: deleteInterviewFromMongoDB } = useRequest({
    url: `/api/interview/delete`,
    method: 'DELETE',
    showPopup: false,
  });

  const { trigger: deleteInterviewFromFirebase } = useRequest({
    url: `/api/firebase/delete`,
    method: 'DELETE',
    showPopup: false,
  });

  const updateProgressItem = (index, status) => {
    setProgressItems(prev => prev.map((item, i) => (i === index ? { ...item, status } : item)));
  };

  useEffect(() => {
    if (isRunning || !id) return;

    const run = async () => {
      setIsRunning(true);
      const tasks = [
        { name: 'Удаление записи из базы данных', status: 'pending' },
        { name: 'Удаление аудиофайлов из хранилища', status: 'pending' },
      ];
      setProgressItems(tasks);

      await new Promise(res => setTimeout(res, 1000));
      await deleteInterview();
      setIsRunning(false);
    };

    run();
  }, [id]);

  const deleteInterview = async () => {
    try {
      const deleteTasks = [
        async () => {
          try {
            await deleteInterviewFromMongoDB({ _id: id });
            updateProgressItem(0, 'fullfield');
          } catch (err) {
            console.error('Ошибка удаления из MongoDB:', err);
            updateProgressItem(0, 'rejected');
          }
        },
        async () => {
          try {
            await deleteInterviewFromFirebase({ _id: id });
            updateProgressItem(1, 'fullfield');
          } catch (err) {
            console.error('Ошибка удаления из Firebase:', err);
            updateProgressItem(1, 'rejected');
          }
        },
      ];

      await Promise.all(deleteTasks.map(task => task()));

      resetUpdates();
      resetInterview();

      await new Promise(res => setTimeout(res, 1500));
      router.replace('/add-new-interview');
      closePopup();
    } catch (error) {
      console.log('Ошибка в процессе удаления интервью:', error);
      updateProgressItem(0, 'rejected');
      updateProgressItem(1, 'rejected');
    }
  };

  return (
    <div className={css.ProgressPopup}>
      <h2>Удаление</h2>
      <ProgressBar procent={percent} progress={progressItems} />
    </div>
  );
};

export default DeleteInterviewPopup;
