'use client';

import React from 'react';
import { Icon, Score } from '@/components';

import css from './CandidateSingle.module.scss';

const CandidateSingle = ({ candidate }) => {
  const { name, position, totalScore, data, video = null } = candidate;

  console.log('video', video);

  return (
    <div className={css.CandidateSingle}>
      <h1>{position}</h1>
      <Score score={totalScore} size="small" />
      <div className={css.Video}>
        {!video && (
          <>
            <strong>Видео отсутствует</strong>
            <p>Возможно при сохранении произошёл сбой</p>
          </>
        )}

        {video && (
          <video
            key={video} // чтобы корректно перерисовывался при смене URL
            src={video} // downloadURL из Firebase
            controls // показывает play/pause, таймлайн и т.д.
            controlsList="nodownload" // необязательно: убрать кнопку «скачать»
            playsInline // на мобилках без фуллскрина
            preload="metadata" // не жрём трафик до клика
            className={css.Player}
          />
        )}
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
