import Link from 'next/link';
import css from './InterviewArticle.module.scss';

const InterviewArticle = ({ interview = {} }) => {
  const { _id, name, category, description, thumbnail, duration, difficulty } = interview;

  const difficultyClassMap = {
    Легкое: css.Green,
    Среднее: css.Yellow,
    Сложное: css.Black,
  };

  const difficultyClass = difficultyClassMap[difficulty] || '';

  return (
    <article className={css.InterviewArticle}>
      <div className={css.Thumbnail} style={{ backgroundColor: thumbnail }}>
        {category && <span>{category}</span>}
      </div>
      <div className={css.TitleBox}>
        <h3 className="two-lines">{name ? name : 'Интервью'}</h3>
        <p className="three-lines">{description ? description : 'Без описания...'}</p>
      </div>
      <ul className={css.Info}>
        {duration && (
          <li>
            <span>{duration} мин.</span>
          </li>
        )}

        {difficulty && (
          <li className={difficultyClass}>
            <span>{difficulty}</span>
          </li>
        )}
      </ul>
      {_id && <Link href={`/interviews/${_id}`} className={css.Link}></Link>}
    </article>
  );
};

export default InterviewArticle;
