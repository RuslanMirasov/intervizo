'use client';

import { useEffect } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { Button, SectionsEditor, PromtGeneratorForm } from '@/components';
import { initTextareaAutoResize } from '@/lib/initTextareaAutoResize';
import { slugify } from '@/lib/slugify';
import css from './AddNewInterviewForm.module.scss';

const AddNewInterviewForm = () => {
  const { interview, setInterview } = useInterview();

  useEffect(() => {
    const cleanup = initTextareaAutoResize();
    return cleanup;
  }, []);

  useEffect(() => {
    console.log(interview.data);
    console.log(interview.data.length);
  }, [interview]);

  const updateField = (field, value) => {
    setInterview(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Button href="./connect" className="small border" disabled={interview.data.length === 0}>
        Тестовое интервью
      </Button>

      <div className={css.AddNewInterviewForm}>
        <textarea
          name="name"
          placeholder="Введите название"
          value={interview.name}
          onChange={e => {
            updateField('name', e.target.value);
            updateField('slug', slugify(e.target.value));
          }}
        ></textarea>

        <textarea
          name="description"
          placeholder="Введите описание вакансии"
          value={interview.description}
          onChange={e => updateField('description', e.target.value)}
        ></textarea>

        <PromtGeneratorForm />
        <SectionsEditor />
      </div>
    </>
  );
};

export default AddNewInterviewForm;
