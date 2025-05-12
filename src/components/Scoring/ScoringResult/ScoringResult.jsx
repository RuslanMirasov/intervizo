'use client';

import React from 'react';
import { Icon, Score } from '@/components';
import useLocalStorageState from 'use-local-storage-state';
import css from './ScoringResult.module.scss';

const ScoringResult = () => {
  const [progress] = useLocalStorageState('interview-progress', {
    defaultValue: [],
  });

  const [interview] = useLocalStorageState('interview', {
    defaultValue: [],
  });

  return (
    <div className={css.ScoringResult}>
      <h1>{interview.name}</h1>
      <Score score={interview.score} size="small" />
      <div className={css.Video}>
        <strong>Видео в процессе</strong>
        <p>Время обработки 5-10 минут</p>
      </div>
      <ul className={css.Interview}>
        {progress.map(({ id, question, answer, score, feedback }) => (
          <React.Fragment key={id}>
            <li className={css.Question}>{question}</li>
            <li className={css.Answer}>
              <Score score={score} size="small" />
              {answer}
            </li>
            {feedback && (
              <li className={css.Feedback}>
                <Icon name="logo" size="14" />
                {feedback}
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
};

export default ScoringResult;
