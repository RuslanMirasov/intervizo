'use client';
import { useEffect, useState } from 'react';
import { InterviewArticle } from '@/components';
import css from './InterviewList.module.scss';

const InterviewList = () => {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    fetch('/interviews-demo.json')
      .then(res => res.json())
      .then(data => setInterviews(data))
      .catch(err => console.error('Ошибка загрузки интервью:', err));
  }, []);

  return (
    <ul className={css.InterviewList}>
      {interviews.map(interview => (
        <li key={interview.slug} className={css.Item}>
          <InterviewArticle interview={interview} />
        </li>
      ))}
    </ul>
  );
};

export default InterviewList;
