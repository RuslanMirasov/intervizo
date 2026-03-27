'use client';

import useRequest from '@/hooks/useRequest';
import { useInterview } from '@/hooks/useInterview';
import { slugify } from '@/lib/slugify';
import { SectionsEditor, PromtGeneratorForm, Textarea, InterviewInputs, InterviewButtons } from '@/components';

import css from './AddNewInterviewForm.module.scss';
import { useRouter } from 'next/navigation';

const AddNewInterviewForm = ({ id }) => {
  const router = useRouter();
  const { interview, setInterview } = useInterview();
  const {
    data: currentInterview,
    error,
    isLoading,
    mutate: mutateCurrentInterview,
  } = useRequest({
    url: id ? `/api/interview/${id}` : null,
    method: 'GET',
  });

  const handleTextareaChange = e => {
    const { name, value } = e.target;

    setInterview(prev => ({
      ...prev,
      [name]: value,
      slug: name === 'name' ? slugify(value) : prev.slug,
    }));
  };

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
        <Textarea
          name="name"
          placeholder="Введите название"
          value={interview?.name || ''}
          onChange={handleTextareaChange}
        />
        <Textarea
          name="description"
          placeholder="Введите описание вакансии"
          value={interview?.description || ''}
          onChange={handleTextareaChange}
        />
        <InterviewInputs />
        <PromtGeneratorForm />
        <SectionsEditor currentInterview={currentInterview?.interview} />
      </div>
    </>
  );
};

export default AddNewInterviewForm;
