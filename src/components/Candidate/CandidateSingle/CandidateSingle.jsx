'use client';

import React from 'react';
import { Icon, Score } from '@/components';

import css from './CandidateSingle.module.scss';

const CandidateSingle = ({ candidate }) => {
  const { name, position, totalScore, data } = candidate;

  return (
    <div className={css.CandidateSingle}>
      <h1>{position}</h1>
      <Score score={totalScore} size="small" />
      <div className={css.Video}>
        <strong>Видео в процессе</strong>
        <p>Время обработки 5-10 минут</p>
      </div>
      <ul className={css.Interview}>
        {data.map(({ id, question, answer, score, feedback }) => (
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

export default CandidateSingle;
