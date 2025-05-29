'use client';
import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { InputSelect, InterviewList, Input } from '@/components';
import { debounce } from '@/lib/debounce';
import css from './InterviewCatalog.module.scss';

const InterviewCatalog = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const categories = [
    { value: 'empty', label: 'Все категории' },
    { value: 'Разработка', label: 'Разработка' },
    { value: 'Data и AI', label: 'Data и AI' },
    { value: 'Инфраструктура', label: 'Инфраструктура' },
    { value: 'Тестирование', label: 'Тестирование' },
    { value: 'Продукт', label: 'Продукт' },
    { value: 'Дизайн', label: 'Дизайн' },
    { value: 'Бизнес', label: 'Бизнес' },
    { value: 'Маркетинг', label: 'Маркетинг' },
    { value: 'Контент', label: 'Контент' },
    { value: 'Финансы', label: 'Финансы' },
    { value: 'Юридическое', label: 'Юридическое' },
    { value: 'Инженерия', label: 'Инженерия' },
    { value: 'Наука', label: 'Наука' },
    { value: 'Другие', label: 'Другие' },
  ];

  const handleChangeParams = (param, value) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === 'empty' || (Array.isArray(value) && value.length === 0)) {
      params.delete(param);
      router.push(`?${params.toString()}`);
      return;
    }

    params.set(param, Array.isArray(value) ? value.join(',') : value);
    router.push(`?${params.toString()}`);
  };

  const handleCategoryChange = e => {
    const { value, name } = e.target;
    if (!value || !name) return;
    handleChangeParams(name, value);
  };

  const handleDifficultyChange = e => {
    const form = e.target.form;
    const inputs = Array.from(form.querySelectorAll('input[name="difficulty"]:checked'));
    const selectedValues = inputs.map(input => input.value);
    handleChangeParams('difficulty', selectedValues);
  };

  const handleSearch = e => {
    const value = e.target.value;
    debouncedUpdateSearchParams(value);
  };

  const debouncedUpdateSearchParams = useMemo(
    () =>
      debounce(value => {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set('s', value);
        } else {
          params.delete('s');
        }
        router.push(`?${params.toString()}`);
      }, 500),
    [searchParams, router]
  );

  return (
    <div className={css.InterviewCatalog}>
      <header>
        <h1>Все интерьвью</h1>
        <div className={css.Filters}>
          <Input
            size="small"
            name="s"
            placeholder="Поиск"
            value={searchParams.get('s') || ''}
            onChange={handleSearch}
          />
          <InputSelect
            placeholder="Категория"
            options={categories}
            name="category"
            value={searchParams.get('category') || ''}
            onChange={handleCategoryChange}
          />
        </div>
      </header>
      <form className={css.Dificulty}>
        <strong>Сложность</strong>
        {['Легкое', 'Среднее', 'Сложное'].map(level => (
          <label key={level} className={css.Checkbox}>
            <input
              type="checkbox"
              name="difficulty"
              value={level}
              onChange={handleDifficultyChange}
              checked={searchParams.get('difficulty') ? searchParams.get('difficulty').includes(level) : false}
            />
            <b>{level}</b>
          </label>
        ))}
      </form>
      <InterviewList />
    </div>
  );
};

export default InterviewCatalog;
