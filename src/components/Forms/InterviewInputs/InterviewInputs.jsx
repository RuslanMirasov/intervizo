'use client';

import { Input, InputSelect, Skeleton } from '@/components';
import { useInterview } from '@/hooks/useInterview';
import css from './InterviewInputs.module.scss';

const InterviewInputs = () => {
  const { interview, setInterview } = useInterview();

  const difficulty = [
    { value: 'ease', label: 'Легкое' },
    { value: 'medium', label: 'Среднее' },
    { value: 'hard', label: 'Сложное' },
  ];

  const categories = [
    { thumbnail: '#ECEFF5', value: 'develop', label: 'Разработка' },
    { thumbnail: '#D5F6ED', value: 'data_and_ai', label: 'Data и AI' },
    { thumbnail: '#E2DBF9', value: 'infrastructure', label: 'Инфраструктура' },
    { thumbnail: '#E0F3FF', value: 'testing', label: 'Тестирование' },
    { thumbnail: '#C2C2C2', value: 'product', label: 'Продукт' },
    { thumbnail: '#FBE2F3', value: 'design', label: 'Дизайн' },
    { thumbnail: '#D5F6ED', value: 'business', label: 'Бизнес' },
    { thumbnail: '#E0F3FF', value: 'marketing', label: 'Маркетинг' },
    { thumbnail: '#E2DBF9', value: 'content', label: 'Контент' },
    { thumbnail: '#ECEFF5', value: 'finance', label: 'Финансы' },
    { thumbnail: '#FFE1CB', value: 'juridical', label: 'Юридическое' },
    { thumbnail: '#D5F6ED', value: 'engineering', label: 'Инженерия' },
    { thumbnail: '#FBE2F3', value: 'science', label: 'Наука' },
    { thumbnail: '#ECEFF5', value: 'others', label: 'Другие' },
  ];

  const updateInterview = e => {
    const { name, value, label, thumbnail } = e.target;

    if (!name) return;

    setInterview(prev => {
      return {
        ...prev,
        [name]: label ? label : value,
        thumbnail: thumbnail ? thumbnail : prev.thumbnail,
      };
    });
  };

  if (!interview) return <Skeleton width="40%" height="14px" radius="4px" />;

  const categoryValue = categories.find(item => item.label === interview.category) || null;
  const difficultyValue = difficulty.find(item => item.label === interview.difficulty) || null;
  const durationValue = interview.duration || '';

  return (
    <div className={css.InterviewInputs}>
      <InputSelect
        name="category"
        options={categories}
        placeholder="Категория"
        onChange={updateInterview}
        value={categoryValue}
      />
      <InputSelect
        name="difficulty"
        options={difficulty}
        placeholder="Сложность"
        onChange={updateInterview}
        value={difficultyValue}
      />
      <Input
        type="number"
        size="small"
        name="duration"
        placeholder="Длительность (мин.)"
        onChange={updateInterview}
        value={durationValue}
      />
    </div>
  );
};

export default InterviewInputs;
