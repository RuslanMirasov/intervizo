'use client';

import { useEffect } from 'react';
import useRequest from '@/hooks/useRequest';
import { SectionsEditor, PromtGeneratorForm, Textarea, InterviewInputs, InterviewButtons } from '@/components';
import { initTextareaAutoResize } from '@/lib/initTextareaAutoResize';

import css from './AddNewInterviewForm.module.scss';
import { useRouter } from 'next/navigation';

const AddNewInterviewForm = ({ id }) => {
  const router = useRouter();
  const {
    data: currentInterview,
    error,
    isLoading,
    mutate: mutateCurrentInterview,
  } = useRequest({
    url: id ? `/api/interview/${id}` : null,
    method: 'GET',
  });

  useEffect(() => {
    const cleanup = initTextareaAutoResize();
    return cleanup;
  }, []);

  if (id && isLoading) return null;

  if (error) {
    router.replace('/404');
  }

  return (
    <>
      <InterviewButtons
        currentInterview={currentInterview?.interview}
        mutateCurrentInterview={mutateCurrentInterview}
      />
      <div className={css.AddNewInterviewForm}>
        <Textarea name="name" placeholder="Введите название" />
        <Textarea name="description" placeholder="Введите описание вакансии" />
        <InterviewInputs />
        <PromtGeneratorForm />
        <SectionsEditor currentInterview={currentInterview?.interview} />
      </div>
    </>
  );
};

export default AddNewInterviewForm;
