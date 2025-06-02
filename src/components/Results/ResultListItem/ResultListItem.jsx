import { Score } from '@/components';
import Link from 'next/link';
import css from './ResultListItem.module.scss';

const ResultListItem = ({ candidate, index }) => {
  const { name, position, createdAt, totalScore = 0.0, interviewId, _id } = candidate;

  return (
    <Link href={`/interviews/${interviewId}/${_id}`} className={css.ResultListItem}>
      <div className={css.ListProfile}>
        <div
          className={css.Avatar}
          style={{ background: `url('/avatars/${String(index + 1).slice(-1)}.webp')no-repeat center center/cover` }}
        ></div>
        <div className={css.Text}>
          <h3>{name}</h3>
          {position && <p>{position}</p>}
        </div>
      </div>
      <div className={css.ListInfo}>
        {createdAt && (
          <p>
            {new Date(createdAt).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </p>
        )}
        <Score score={totalScore} size="small" />
      </div>
    </Link>
  );
};

export default ResultListItem;
