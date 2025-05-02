import Link from 'next/link';
import css from './ResultListItem.module.scss';

const ResultListItem = ({ result }) => {
  const { name, vacancy, avatar, date, rating = 0.0 } = result;

  return (
    <Link href="./" className={css.ResultListItem}>
      <div className={css.ListProfile}>
        <div className={css.Avatar}>
          {avatar && <img src={avatar} alt={name ? name : 'Аватарка'} width={56} height={56} />}
        </div>
        <div className={css.Text}>
          <h3>{name ? name : 'Неизвестно'}</h3>
          {vacancy && <p>{vacancy}</p>}
        </div>
      </div>
      <div className={css.ListInfo}>
        {date && <p>{date}</p>}
        <span>{String(rating)}</span>
      </div>
    </Link>
  );
};

export default ResultListItem;
