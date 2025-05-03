'use client';
import useSWR from 'swr';
import fetcher from '@/lib/fetcher';

import { ResultListItem, ResultsListSkeleton } from '@/components';
import css from './ResultsList.module.scss';

const ResultsList = () => {
  const { data: results = [], isLoading, error } = useSWR('/candidates-demo.json', fetcher);

  if (error) {
    return <p className={css.NotFound}>Ошибка загрузки данных</p>;
  }

  return (
    <div className={css.Wrapper}>
      <div className="titleBox">
        <h2>Список интервью</h2>
      </div>
      {isLoading ? (
        <ResultsListSkeleton />
      ) : results.length === 0 ? (
        <p className={css.NotFound}>Нет интервью</p>
      ) : (
        <ul className={css.ResultsList}>
          {results.map(result => (
            <li key={result.id}>
              <ResultListItem result={result} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResultsList;
