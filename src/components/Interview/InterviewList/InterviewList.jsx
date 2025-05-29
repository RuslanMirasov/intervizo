'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { InterviewArticle, InterviewListSkeleton, Button } from '@/components';
import useRequest from '@/hooks/useRequest';
import css from './InterviewList.module.scss';

const InterviewList = () => {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [interviews, setInterviews] = useState([]);
  const [pagination, setPagination] = useState(null);

  const queryString = new URLSearchParams(searchParams);
  queryString.set('page', page.toString());

  const { data, error, isLoading } = useRequest({
    url: `/api/interview?${queryString.toString()}`,
    method: 'GET',
  });

  useEffect(() => {
    if (data) {
      setInterviews(prev => (page === 1 ? data.interviews : [...prev, ...data.interviews]));
      setPagination(data.pagination);
    }
  }, [data]);

  if (error) return <h2>Ошибка загрузки интервью</h2>;
  if (isLoading) return <InterviewListSkeleton />;

  return (
    <div className={css.Wrapper}>
      <ul className={css.InterviewList}>
        {interviews.length === 0 && <p className={css.Empty}>Нет ни одного интервью</p>}
        {interviews.length > 0 &&
          interviews.map(interview => (
            <li key={interview._id} className={css.Item}>
              <InterviewArticle interview={interview} />
            </li>
          ))}
      </ul>

      {pagination?.hasNextPage && (
        <Button className="small border" onClick={() => setPage(prev => prev + 1)} disabled={isLoading}>
          {isLoading ? 'Загрузка...' : 'Загрузить ещё'}
        </Button>
      )}
    </div>
  );
};

export default InterviewList;
