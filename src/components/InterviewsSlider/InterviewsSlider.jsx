'use client';
import { useEffect, useState } from 'react';
import { Button, Icon, InterviewArticle } from '@/components';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import css from './InterviewsSlider.module.scss';

const InterviewsSlider = () => {
  const [interviews, setInterviews] = useState([]);

  useEffect(() => {
    fetch('/interviews-demo.json')
      .then(res => res.json())
      .then(data => setInterviews(data))
      .catch(err => console.error('Ошибка загрузки интервью:', err));
  }, []);

  return (
    <div className={css.InterviewsSlider}>
      <Button href="./add-new-interview" className="add">
        <Icon name="border" />
        <Icon name="plus" size="56" />
        Add
        <br />
        interview
      </Button>
      <div className={css.SliderWrapper}>
        <Swiper slidesPerView={4}>
          {interviews.slice(0, 8).map(interview => (
            <SwiperSlide key={interview.slug}>
              <InterviewArticle interview={interview} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default InterviewsSlider;
