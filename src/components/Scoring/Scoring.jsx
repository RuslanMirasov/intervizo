'use client';

import { useState, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import useRequest from '@/hooks/useRequest';
import { Button, Preloader, ProgressBar, Score } from '@/components';
import css from './Scoring.module.scss';

const Scoring = () => {
  const [isComplete, setIsComplete] = useState(false);
  const [progressItems, setProgressItems] = useState([]);
  const [hasStartedScoring, setHasStartedScoring] = useState(false);
  const percent =
    progressItems.length > 0
      ? Math.round(
          (progressItems.filter(item => item.status === 'fullfield' || item.status === 'rejected').length /
            progressItems.length) *
            100
        )
      : 0;

  const [progress, setProgress] = useLocalStorageState('progress', {
    defaultValue: [],
  });

  const [interview, setInterview] = useLocalStorageState('interview', {
    defaultValue: {},
  });

  const { trigger, isMutating } = useRequest({
    url: '/api/score',
    method: 'POST',
  });

  // Инициализация progressItems
  useEffect(() => {
    if (progress && progress.length > 0) {
      setProgressItems(
        progress.map((_, index) => ({
          name: `Процесс обработки вопроса №${index + 1}`,
          status: 'pending',
        }))
      );
    }
  }, [progress]);

  // Функция для обновления статуса конкретного вопроса
  const updateProgressItem = (index, status) => {
    setProgressItems(prev => prev.map((item, i) => (i === index ? { ...item, status } : item)));
  };

  // Функция для запуска скорирования
  const startScoring = async () => {
    if (hasStartedScoring || !progress || progress.length === 0) return;

    setHasStartedScoring(true);

    try {
      // Создаем промисы для всех вопросов
      const scoringPromises = progress.map(async (item, index) => {
        try {
          updateProgressItem(index, 'pending');

          const result = await trigger({
            question: item.question,
            answer: item.answer,
            questionIndex: index,
          });

          if (result.success) {
            updateProgressItem(index, 'fullfield');
            return {
              index,
              score: result.data.score,
              feedback: result.data.feedback,
            };
          } else {
            updateProgressItem(index, 'rejected');
            return {
              index,
              score: 3.0,
              feedback: 'Ошибка при оценке вопроса',
            };
          }
        } catch (error) {
          console.error(`Ошибка при скорировании вопроса ${index + 1}:`, error);
          updateProgressItem(index, 'rejected');
          return {
            index,
            score: 3.0,
            feedback: 'Ошибка при оценке вопроса',
          };
        }
      });

      // Ждем завершения всех запросов
      const results = await Promise.allSettled(scoringPromises);

      // Обрабатываем результаты
      const updatedProgress = [...progress];
      let totalScore = 0;
      let validScores = 0;

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const { score, feedback } = result.value;
          updatedProgress[index] = {
            ...updatedProgress[index],
            score,
            feedback,
          };
          totalScore += score;
          validScores++;
        } else {
          // Fallback для неудачных запросов
          updatedProgress[index] = {
            ...updatedProgress[index],
            score: 3.0,
            feedback: 'Ошибка при оценке',
          };
          totalScore += 3.0;
          validScores++;
        }
      });

      // Вычисляем средний балл
      const averageScore = validScores > 0 ? totalScore / validScores : 3.0;

      // Сохраняем обновленные данные
      setProgress(updatedProgress);
      setInterview(prev => ({
        ...prev,
        score: Math.round(averageScore * 10) / 10, // Округляем до 1 знака после запятой
      }));

      setIsComplete(true);
    } catch (error) {
      console.error('Ошибка при скорировании:', error);
      // В случае критической ошибки показываем результат с нейтральными оценками
      setIsComplete(true);
    }
  };

  // Автоматический запуск скорирования при загрузке
  useEffect(() => {
    if (progressItems.length > 0 && !hasStartedScoring && !isComplete) {
      const timer = setTimeout(() => {
        startScoring();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [progressItems, hasStartedScoring, isComplete]);

  if (!progress || progress.length === 0) return <Preloader />;

  return (
    <div className={css.Scoring}>
      {!isComplete ? (
        <>
          <h1>Идет оценка интервью</h1>
          <ProgressBar procent={percent} progress={progressItems} />
          <p>Так же готовим обратную связь для улучшения ваших навыков</p>
        </>
      ) : (
        <>
          <h1>Вы набрали</h1>
          <Score score={interview.score} />
          <Button href="./scoring/result" className="full radius">
            Смотреть результат
          </Button>
        </>
      )}
    </div>
  );
};

export default Scoring;
