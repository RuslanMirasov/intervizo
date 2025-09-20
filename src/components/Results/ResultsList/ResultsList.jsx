'use client';

import useRequest from '@/hooks/useRequest';
import { useSession } from 'next-auth/react';
import { debounce } from '@/lib/debounce';
import { Input, ResultListItem, ResultsListSkeleton } from '@/components';
import css from './ResultsList.module.scss';
import { useState, useMemo, useEffect } from 'react';

const ResultsList = ({ interviewId = '' }) => {
  const [search, setSearch] = useState('');
  const { data: session } = useSession();
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const debouncedUpdate = useMemo(
    () =>
      debounce(value => {
        setDebouncedSearch(value);
      }, 800),
    []
  );

  useEffect(() => {
    debouncedUpdate(search);
    return debouncedUpdate.cancel;
  }, [search, debouncedUpdate]);

  const { data, error, isLoading } = useRequest({
    url: `/api/candidate?interviewId=${interviewId}&s=${debouncedSearch}&company=${session?.user?.id}`,
    method: 'GET',
  });

  if (error) {
    return <p className={css.NotFound}>Ошибка загрузки данных</p>;
  }

  const candidates = data?.candidates || [];

  return (
    <div className={css.Wrapper}>
      <div className={css.Header}>
        <h2>Список кандидатов</h2>
        {!interviewId && (
          <Input
            type="search"
            name="s"
            size="small"
            placeholder="Поиск"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        )}
      </div>
      {isLoading ? (
        <ResultsListSkeleton />
      ) : candidates.length === 0 ? (
        <p className={css.NotFound}>Нет кандидатов прошедших интервью</p>
      ) : (
        <ul className={css.ResultsList}>
          {candidates.map((candidate, index) => (
            <li key={candidate._id}>
              <ResultListItem candidate={candidate} index={index} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ResultsList;
