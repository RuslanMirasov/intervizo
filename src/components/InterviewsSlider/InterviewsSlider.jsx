'use client';

import useSWR from 'swr';
import fetcher from '@/lib/fetcher';
import { Button, Icon, InterviewArticle, InterviewsSliderSkeleton } from '@/components';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import css from './InterviewsSlider.module.scss';

const InterviewsSlider = () => {
  const { data: interviews, isLoading, error } = useSWR('/interviews-demo.json', fetcher);

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
                {interviews?.slice(0, 8).map(interview => (
                  <SwiperSlide key={interview.slug}>
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
