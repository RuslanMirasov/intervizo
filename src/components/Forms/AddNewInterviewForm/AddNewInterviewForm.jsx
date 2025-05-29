'use client';

import { useEffect } from 'react';
import { SectionsEditor, PromtGeneratorForm, Textarea, InterviewInputs, InterviewButtons } from '@/components';
import { initTextareaAutoResize } from '@/lib/initTextareaAutoResize';

import css from './AddNewInterviewForm.module.scss';

const AddNewInterviewForm = ({ currentInterview }) => {
  console.log('AddNewInterviewForm RERENDER');

  useEffect(() => {
    const cleanup = initTextareaAutoResize();
    return cleanup;
  }, []);

  return (
    <>
      <InterviewButtons currentInterview={currentInterview} />
      <div className={css.AddNewInterviewForm}>
        <Textarea name="name" placeholder="Введите название" />
        <Textarea name="description" placeholder="Введите описание вакансии" />
        <InterviewInputs />
        <PromtGeneratorForm />
        <SectionsEditor />
      </div>
    </>
  );
};

export default AddNewInterviewForm;
