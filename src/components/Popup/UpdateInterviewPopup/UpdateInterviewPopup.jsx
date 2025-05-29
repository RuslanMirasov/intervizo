'use client';

import { useState, useEffect } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { usePopup } from '@/hooks/usePopup';
import { ProgressBar } from '@/components';
import useRequest from '@/hooks/useRequest';

import css from './UpdateInterviewPopup.module.scss';
import { useRouter } from 'next/navigation';

const UpdateInterviewPopup = ({ params }) => {
  const router = useRouter();
  const { closePopup } = usePopup();
  const { interview, resetInterview } = useInterview();
  const [progressItems, setProgressItems] = useState([]);

  const { trigger: saveInterviewToMongoDB } = useRequest({
    url: '/api/interview/add',
    method: 'POST',
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
    const run = async () => {
      if (!interview || !interview.data.length) return;

      // 1. Инициализируем задачи
      const tasks = [
        { name: 'Сохранение интервью в базу данных', status: 'pending' },
        ...interview.data.map((item, index) => ({
          name: `Генерация аудио для ${index + 1}-го ${item.type === 'message' ? 'сообщения' : 'вопроса'}`,
          status: 'pending',
        })),
      ];
      setProgressItems(tasks);

      await new Promise(res => setTimeout(res, 0));

      //await saveInterview();
    };

    run();
  }, [interview]);

  const generateAudioForAllQuestions = async newData => {
    const { _id, company, data } = newData;

    const queue = [...data]; // копируем массив
    let index = 0;

    const workers = Array.from({ length: 3 }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        const currentIndex = index++;

        try {
          const response = await fetch('/api/firebase', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ _id, company, index: currentIndex, item }),
          });

          if (!response.ok) {
            updateProgressItem(currentIndex + 1, 'rejected');
            continue;
          }

          updateProgressItem(currentIndex + 1, 'fullfield');
        } catch (error) {
          console.log('Ошибка генерации аудио:', error);
          updateProgressItem(currentIndex + 1, 'rejected');
        }
      }
    });

    await Promise.all(workers);
  };

  const saveInterview = async () => {
    try {
      const newInterview = await saveInterviewToMongoDB(interview);

      if (!newInterview.success) {
        updateProgressItem(0, 'rejected');
        return;
      }

      updateProgressItem(0, 'fullfield');

      await generateAudioForAllQuestions(newInterview.newinterview);
      await new Promise(res => setTimeout(res, 2000));
      resetInterview();
      closePopup();
      router.push('/');
    } catch (error) {
      console.log('При сохранении интервью в MongoDB произошла ошибка', error);
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
