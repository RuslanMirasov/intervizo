'use client';

import { useState, useEffect } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { usePopup } from '@/hooks/usePopup';
import { ProgressBar } from '@/components';
import useRequest from '@/hooks/useRequest';
import css from './UpdateInterviewPopup.module.scss';

const UpdateInterviewPopup = ({ params }) => {
  const { id, mutateCurrentInterview } = params;
  const [isRunning, setIsRunning] = useState(false);
  const { closePopup } = usePopup();
  const { updates, resetUpdates } = useInterview();
  const [progressItems, setProgressItems] = useState([]);

  const { trigger: updateInterviewInMongoDB } = useRequest({
    url: '/api/interview/update',
    method: 'PATCH',
  });

  const percent =
    progressItems.length > 0
      ? Math.round(
          (progressItems.filter(item => item.status === 'fullfield' || item.status === 'rejected').length /
            progressItems.length) *
            100
        )
      : 0;

  // Функция для обновления статуса конкретного элемента
  const updateProgressItem = (index, status) => {
    setProgressItems(prev => prev.map((item, i) => (i === index ? { ...item, status } : item)));
  };

  useEffect(() => {
    if (isRunning || !updates || Object.keys(updates).length === 0) return;

    const run = async () => {
      setIsRunning(true);
      const tasks = [{ name: 'Обновление в базе данных', status: 'pending' }];
      setProgressItems(tasks);

      await new Promise(res => setTimeout(res, 1000));
      await updateInterview();
      setIsRunning(false);
    };

    run();
  }, [updates]);

  const updateDataInFirebase = async newData => {
    const { _id, company, data } = newData;

    const queue = [...data];
    let index = 0;

    const workers = Array.from({ length: 2 }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        const currentIndex = index++;

        try {
          let method = 'POST';
          if (item.todo === 'delete') method = 'DELETE';
          else if (item.todo === 'generate' && item.audio) method = 'PATCH';

          const response = await fetch('/api/firebase/update', {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id, company, item }),
          });

          if (!response.ok) {
            updateProgressItem(currentIndex + 1, 'rejected');
            continue;
          }

          updateProgressItem(currentIndex + 1, 'fullfield');
        } catch (error) {
          updateProgressItem(currentIndex + 1, 'rejected');
        }
      }
    });

    await Promise.all(workers);
  };

  const updateInterview = async () => {
    try {
      const updateData = { ...updates, _id: id };
      const newInterview = await updateInterviewInMongoDB(updateData);

      if (!newInterview.success) {
        updateProgressItem(0, 'rejected');
        return;
      }

      if (newInterview.updatedinterview.data.length > 0) {
        const newTasks = newInterview.updatedinterview.data.map((item, index) => ({
          name: `${index}. Генерация нового аудиофайла`,
          status: 'pending',
        }));

        setProgressItems(prev => [...prev, ...newTasks]);
      }

      updateProgressItem(0, 'fullfield');

      if (newInterview.updatedinterview?.data?.length) {
        await updateDataInFirebase(newInterview.updatedinterview);
      }

      resetUpdates();

      if (typeof mutateCurrentInterview === 'function') {
        await mutateCurrentInterview(undefined, { revalidate: true });
      }

      await new Promise(res => setTimeout(res, 1500));
      closePopup();
    } catch (error) {
      updateProgressItem(0, 'rejected');
    }
  };

  return (
    <div className={css.ProgressPopup}>
      <h2>Обновление</h2>

      <p>Мы генерируем аудио для каждого вопроса, не закрывайте страницу.</p>
      <ProgressBar procent={percent} progress={progressItems} />
    </div>
  );
};

export default UpdateInterviewPopup;
