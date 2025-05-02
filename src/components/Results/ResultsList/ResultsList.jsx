'use client';
import { useEffect, useState } from 'react';
import { ResultListItem } from '@/components';
import Link from 'next/link';
import css from './ResultsList.module.scss';

const ResultsList = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetch('/candidates-demo.json')
      .then(res => res.json())
      .then(data => setResults(data))
      .catch(err => console.error('Ошибка загрузки:', err));
  }, []);

  return (
    <div className={css.Wrapper}>
      <div className="titleBox">
        <h2>Список интервью</h2>
      </div>
      <ul className={css.ResultsList}>
        {results.map(result => (
          <li key={result.id}>
            <ResultListItem result={result} />
          </li>
        ))}
        {/* <li>
          <Link href="./" className={css.Item}>
            <div className={css.ListProfile}>
              <div className={css.Avatar}>
                <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=user18" alt="Image" width={56} height={56} />
              </div>
              <div className={css.Text}>
                <h3>Фамилия Имя канидата</h3>
                <p>Вакансия</p>
              </div>
            </div>
            <div className={css.ListInfo}>
              <p>01.05.2025</p>
              <span>4.8</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="./" className={css.Item}>
            <div className={css.ListProfile}>
              <div className={css.Avatar}>
                <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=user180" alt="Image" width={56} height={56} />
              </div>
              <div className={css.Text}>
                <h3>Фамилия Имя канидата</h3>
                <p>Вакансия</p>
              </div>
            </div>
            <div className={css.ListInfo}>
              <p>01.05.2025</p>
              <span>4.8</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="./" className={css.Item}>
            <div className={css.ListProfile}>
              <div className={css.Avatar}>
                <img src="https://api.dicebear.com/7.x/thumbs/svg?seed=user14" alt="Image" width={56} height={56} />
              </div>
              <div className={css.Text}>
                <h3>Фамилия Имя канидата</h3>
                <p>Вакансия</p>
              </div>
            </div>
            <div className={css.ListInfo}>
              <p>01.05.2025</p>
              <span>4.8</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="./" className={css.Item}>
            <div className={css.ListProfile}>
              <div className={css.Avatar}></div>
              <div className={css.Text}>
                <h3>Фамилия Имя канидата</h3>
                <p>Вакансия</p>
              </div>
            </div>
            <div className={css.ListInfo}>
              <p>01.05.2025</p>
              <span>4.8</span>
            </div>
          </Link>
        </li>
        <li>
          <Link href="./" className={css.Item}>
            <div className={css.ListProfile}>
              <div className={css.Avatar}></div>
              <div className={css.Text}>
                <h3>Фамилия Имя канидата</h3>
                <p>Вакансия</p>
              </div>
            </div>
            <div className={css.ListInfo}>
              <p>01.05.2025</p>
              <span>4.8</span>
            </div>
          </Link>
        </li> */}
      </ul>
    </div>
  );
};

export default ResultsList;
