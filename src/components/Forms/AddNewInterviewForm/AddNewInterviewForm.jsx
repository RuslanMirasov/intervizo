'use client';

import { useState, useEffect } from 'react';
import {
  Button,
  SectionsEditor,
  PromtGeneratorForm,
  Flex,
  Textarea,
  InterviewInputs,
  AddNewInterviewButtons,
} from '@/components';
import { initTextareaAutoResize } from '@/lib/initTextareaAutoResize';
import { debounce } from '@/lib/debounce';

import css from './AddNewInterviewForm.module.scss';

const AddNewInterviewForm = () => {
  console.log('AddNewInterviewForm RERENDER');

  useEffect(() => {
    const cleanup = initTextareaAutoResize();
    return cleanup;
  }, []);

  return (
    <>
      <Flex className={css.Buttons}>
        <AddNewInterviewButtons />
      </Flex>
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
