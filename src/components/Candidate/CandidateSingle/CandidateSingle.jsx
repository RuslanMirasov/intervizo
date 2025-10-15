'use client';

import React from 'react';
import { Icon, Score, VideoPlayer } from '@/components';

import css from './CandidateSingle.module.scss';

const CandidateSingle = ({ candidate }) => {
  const { position, totalScore, data, video = null } = candidate;

  console.log('video', video);

  return (
    <div className={css.CandidateSingle}>
      <h1>{position}</h1>
      <Score score={totalScore} size="small" />
      <VideoPlayer url={video} />
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
