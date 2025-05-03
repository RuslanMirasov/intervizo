import Image from 'next/image';
import Link from 'next/link';
import css from './InterviewArticle.module.scss';

const InterviewArticle = ({ interview = {} }) => {
  const { slug, name, category, description, thumbnail, duration, difficulty } = interview;

  const difficultyClassMap = {
    Легкое: css.Green,
    Среднее: css.Yellow,
    Сложное: css.Black,
  };

  const difficultyClass = difficultyClassMap[difficulty] || '';

  return (
    <article className={css.InterviewArticle}>
      <div className={css.Thumbnail}>
        {thumbnail && <Image src={thumbnail} alt={name} width={260} height={138} />}
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
      {slug && <Link href={`./interviews/${slug}`} className={css.Link}></Link>}
    </article>
  );
};

export default InterviewArticle;
