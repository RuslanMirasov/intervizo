'use client';

import css from './Score.module.scss';

const Score = ({ score = 0, size }) => {
  const result = Number(score);
  return (
    <strong
      className={`${css.Score} ${result >= 4 ? css.Green : result < 3 ? css.Red : ''} ${
        size === 'small' ? css.Small : ''
      }`}
    >
      {result}
    </strong>
  );
};

export default Score;
