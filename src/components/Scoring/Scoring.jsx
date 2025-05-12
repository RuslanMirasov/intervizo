'use client';

import { useState, useEffect } from 'react';
import useLocalStorageState from 'use-local-storage-state';
import useRequest from '@/hooks/useRequest';
import { Button, Preloader, Score } from '@/components';
import css from './Scoring.module.scss';

const Scoring = () => {
  const [score, setScore] = useState(null);

  const [progress, setProgress] = useLocalStorageState('interview-progress', {
    defaultValue: [],
  });

  const [interview, setInterview] = useLocalStorageState('interview', {
    defaultValue: [],
  });

  const { trigger, isMutating } = useRequest({
    url: '/api/score',
    method: 'POST',
  });

  useEffect(() => {
    const shouldScore = progress.length > 0 && interview.data?.length > 0 && !interview.score;

    if (!shouldScore) return;

    console.log(progress);

    trigger({ progress })
      .then(data => {
        if (!data?.progress || typeof data.totalScore !== 'number') return;

        // Обновляем общий балл и локальное хранилище
        setScore(data.totalScore);
        setProgress(data.progress);
        setInterview(prev => ({ ...prev, score: data.totalScore }));
      })
      .catch(err => {
        console.error('Ошибка при оценке интервью:', err);
      });
  }, [progress, interview, trigger, setProgress, setInterview]);

  return (
    <div className={css.Scoring}>
      {score === null && !interview.score && (
        <>
          {isMutating && <h1>Идет оценка интервью</h1>}
          <Preloader />
          {isMutating && <p>Так же готовим обратную связь для улучшения ваших навыков</p>}
        </>
      )}

      {(score !== null || interview.score) && (
        <>
          <h1>Вы набрали</h1>
          <Score score={score || interview.score} />
          <Button href="./scoring/result" className="full radius">
            Смотреть результат
          </Button>
        </>
      )}
    </div>
  );
};

export default Scoring;
