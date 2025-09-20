'use client';

import { useEffect, useState } from 'react';
import useRequest from '@/hooks/useRequest';
import { useSession } from 'next-auth/react';
import { Button, Icon, InterviewArticle, InterviewsSliderSkeleton } from '@/components';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import css from './InterviewsSlider.module.scss';

const InterviewsSlider = () => {
  const [interviews, setInterviews] = useState([]);
  const { data: session } = useSession();
  const { data, isLoading, error } = useRequest({ url: `/api/interview?limit=10&company=${session?.user?.id}` });

  useEffect(() => {
    if (data) {
      setInterviews(data.interviews);
    }
  }, [data]);

  return (
    <>
      <div className="titleBox">
        <h1>Добро пожаловать</h1>
        <p>Выберите интервью или создайте свой</p>
      </div>

      {interviews?.length > 0 && (
        <Link href="./interviews" className="link">
          Смотреть все интервью
        </Link>
      )}

      <div className={css.InterviewsSlider}>
        <Button href="./add-new-interview" className="add">
          <Icon name="border" />
          <Icon name="plus" size="56" />
          Добавить
          <br />
          интервью
        </Button>

        {!error && (
          <div className={css.SliderWrapper}>
            {isLoading ? (
              <InterviewsSliderSkeleton />
            ) : (
              <Swiper slidesPerView={4} spaceBetween={12} className="swiper-wrapper-fixed">
                {interviews &&
                  interviews?.map(interview => (
                    <SwiperSlide key={interview._id}>
                      <InterviewArticle interview={interview} />
                    </SwiperSlide>
                  ))}
              </Swiper>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default InterviewsSlider;
