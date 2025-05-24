'use client';

import { useState, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import useRequest from '@/hooks/useRequest';
import { Button, Preloader, Score } from '@/components';
import css from './Scoring.module.scss';

const Scoring = () => {
  const [isScoring, setIsScoring] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasAttempted, setHasAttempted] = useState(false);

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

  useEffect(() => {
    const scoreInterview = async () => {
      if (!progress || progress.length === 0) return;

      // Проверяем, есть ли уже оценки в progress
      const hasScores = progress.some(item => item.score > 0 || item.feedback);

      // Если есть оценки и есть общий балл в interview, показываем результат
      if (hasScores && interview.score !== undefined) {
        setIsComplete(true);
        return;
      }

      // Если нет оценок, нужно оценить
      const needsScoring = progress.every(item => item.score === 0 && !item.feedback);

      if (needsScoring && !isScoring && !hasAttempted) {
        setIsScoring(true);
        setHasAttempted(true);

        try {
          console.log('Отправляем данные на оценку:', progress);
          const result = await trigger({ progress });

          if (result?.data) {
            console.log('Результат оценки от OpenAI:', result.data);

            // Обновляем progress с новыми данными
            setProgress(result.data);

            // Вычисляем средний балл и сохраняем в interview
            const totalScore = result.data.reduce((sum, item) => sum + item.score, 0);
            const averageScore = totalScore / result.data.length;
            const roundedScore = Math.round(averageScore * 10) / 10;

            setInterview(prev => ({
              ...prev,
              score: roundedScore,
            }));

            setIsComplete(true);
          }
        } catch (error) {
          console.error('Ошибка при оценке интервью:', error);
          setHasAttempted(false);
        } finally {
          setIsScoring(false);
        }
      }
    };

    scoreInterview();
  }, [progress, interview, trigger, isScoring, hasAttempted, setProgress, setInterview]);

  useEffect(() => {
    if (progress && progress.length > 0) {
      console.log('Данные progress:', progress);
    }
  }, [progress]);

  useEffect(() => {
    if (interview) {
      console.log('Данные interview:', interview);
    }
  }, [interview]);

  const retryScoring = () => {
    setHasAttempted(false);
    setIsComplete(false);

    // Сбрасываем оценки в progress
    const resetProgress = progress.map(item => ({
      ...item,
      score: 0,
      feedback: null,
    }));
    setProgress(resetProgress);

    // Убираем общий балл из interview
    setInterview(prev => {
      const { score, ...rest } = prev;
      return rest;
    });
  };

  if (!progress || progress.length === 0) return <Preloader />;

  return (
    <div className={css.Scoring}>
      {!isComplete ? (
        <>
          <h1>Идет оценка интервью</h1>
          <Preloader />
          <p>Так же готовим обратную связь для улучшения ваших навыков</p>
          {hasAttempted && !isScoring && (
            <Button onClick={retryScoring} className="retry">
              Попробовать снова
            </Button>
          )}
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
