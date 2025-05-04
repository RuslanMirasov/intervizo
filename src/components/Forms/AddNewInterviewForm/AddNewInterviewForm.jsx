'use client';

import { useEffect } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { SectionsEditor, PromtGeneratorForm } from '@/components';
import { initTextareaAutoResize } from '@/lib/initTextareaAutoResize';
import { slugify } from '@/lib/slugify';
import css from './AddNewInterviewForm.module.scss';

const AddNewInterviewForm = () => {
  const { interview, setInterview } = useInterview();

  useEffect(() => {
    const cleanup = initTextareaAutoResize();
    return cleanup;
  }, []);

  const updateField = (field, value) => {
    setInterview(prev => ({ ...prev, [field]: value }));
  };

  return (
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
  );
};

export default AddNewInterviewForm;
