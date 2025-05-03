'use client';
import { useEffect, useState } from 'react';
import { ResultListItem } from '@/components';
import css from './ResultsList.module.scss';

const ResultsList = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch('/candidates-demo.json')
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.log('Ошибка загрузки:', err));
  }, []);

  return (
    <div className={css.Wrapper}>
      <div className="titleBox">
        <h2>Список интервью</h2>
      </div>
      {results.length > 0 ? (
        <ul className={css.ResultsList}>
          {results.map(result => (
            <li key={result.id}>
              <ResultListItem result={result} />
            </li>
          ))}
        </ul>
      ) : (
        <p className={css.NotFound}>Нет интервью</p>
      )}
    </div>
  );
};

export default ResultsList;
