'use client';

import useRequest from '@/hooks/useRequest';
import { Flex, Icon, Camera, Preloader, ConnectForm } from '@/components';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgressStorage } from '@/hooks/useProgressStorage';
import css from './Connection.module.scss';
import { useInterview } from '@/hooks/useInterview';

const Connection = ({ id }) => {
  const router = useRouter();
  const { setProgress } = useProgressStorage();
  const { setInterview } = useInterview();

  const {
    data: currentInterview,
    error,
    isLoading,
  } = useRequest({
    url: id ? `/api/interview/${id}` : null,
    method: 'GET',
  });

  const interview = currentInterview?.interview;

  useEffect(() => {
    if (error) {
      router.replace('/404');
    }
  }, [error, router]);

  useEffect(() => {
    if (!interview) return;

    setProgress({
      company: interview.company,
      interviewId: interview._id,
      owners: interview.owners,
      name: '',
      email: '',
      totalScore: 0.0,
      data: [],
    });

    setInterview(interview);
  }, [interview, setProgress, setInterview]);

  if (isLoading || !interview) return <Preloader />;

  return (
    <div className={css.Connection}>
      <Flex className={css.Titles}>
        <h1>{interview.name}</h1>
        <p>Приблизительное время интервью — {interview.duration} минут</p>
      </Flex>

      <div className={css.Camera}>
        <Camera />
      </div>
      <Flex className={css.Buttons}>
        <h2>Готовы к&nbsp;подключению?</h2>
        <div className={css.Logo}>
          <Icon name="logo" size="28" color="var(--color)" />
        </div>
        <p>InterVizo ИИ на связи</p>
        <ConnectForm id={id} />
        <span>InterVizo использует генеративный ИИ для проведения интервью</span>
      </Flex>
    </div>
  );
};

export default Connection;
