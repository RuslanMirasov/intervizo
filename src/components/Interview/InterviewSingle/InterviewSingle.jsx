import { Preloader, ResultsList } from '@/components';
import css from './InterviewSingle.module.scss';

const InterviewSingle = ({ interview }) => {
  if (!interview) return <Preloader />;

  const { _id, name, category, thumbnail, description, duration, difficulty } = interview;

  const difficultyClassMap = {
    Легкое: css.Green,
    Среднее: css.Yellow,
    Сложное: css.Black,
  };

  const difficultyClass = difficultyClassMap[difficulty] || '';

  return (
    <>
      <div className={css.InterviewSingle} style={{ backgroundColor: thumbnail }}>
        <b className={css.Category}>{category}</b>

        <ul className={css.InfoList}>
          <li>
            <b>{duration} мин.</b>
          </li>
          <li className={difficultyClass}>
            <b>{difficulty}</b>
          </li>
        </ul>
      </div>
      <h1>{name}</h1>
      <p className={css.Description}>{description}</p>
      <ResultsList interviewId={_id} />
    </>
  );
};

export default InterviewSingle;
