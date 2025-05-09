'use client';

import { useCamera } from '@/hooks/useCamera';
import { Flex, Icon, Button, Camera } from '@/components';
import { useInterview } from '@/hooks/useInterview';
import css from './Connection.module.scss';
import { useIntro } from '@/hooks/useIntro';

const Connection = () => {
  const { interview } = useInterview();
  const { videoRef, startCamera, stopCamera, error } = useCamera();

  useIntro();

  return (
    <div className={css.Connection}>
      <Flex className={css.Titles}>
        <h1>{interview.name}</h1>
        <p>Приблизительное время интервью — {interview.duration} минут</p>
      </Flex>

      <div className={css.Camera}>
        <Camera videoRef={videoRef} startCamera={startCamera} stopCamera={stopCamera} error={error} />
      </div>
      <Flex className={css.Buttons}>
        <h2>Готовы к&nbsp;подключению?</h2>
        <div className={css.Logo}>
          <Icon name="logo" size="28" color="var(--color)" />
        </div>
        <p>InterVizo ИИ на связи</p>
        <Button href="./room" className="full">
          Подключится
        </Button>
        <span>InterVizo использует генеративный ИИ для проведения интервью</span>
      </Flex>
    </div>
  );
};

export default Connection;
