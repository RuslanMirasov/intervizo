'use client';

import { useState } from 'react';
import { useInterview } from '@/hooks/useInterview';
import { usePopup } from '@/hooks/usePopup';
import useRequest from '@/hooks/useRequest';
import { Button } from '@/components';
import css from './PromtGeneratorForm.module.scss';

const PromtGeneratorForm = () => {
  const [prompt, setPrompt] = useState('');
  const { interview, setInterview } = useInterview();
  const { openPopup, closePopup } = usePopup();

  const { trigger, isMutating } = useRequest({ url: '/api/generate-interview', method: 'POST' });

  const handleSubmit = async e => {
    e.preventDefault();

    openPopup({
      type: 'loading',
      locked: true,
      subtitle: 'ИИ-ассистент составляет интервью по вашему запросу. Это займёт некоторое время.',
    });

    const generated = await trigger({
      prompt,
      existingInterview: interview,
    });

    if (generated) {
      closePopup();
      setInterview(generated);
    }
  };

  return (
    <>
      {interview.data.length === 0 ? (
        <form className={css.PromtGeneratorForm} onSubmit={handleSubmit} noValidate>
          <span>
            Вы можете воспользоваться ИИ-ассистентом — он добавит необходимые вопросы. <br />
            Также вы сможете редактировать их далее.
          </span>
          <label>
            <input
              type="text"
              name="prompt"
              placeholder="Для какой должности хотели бы провести интервью?"
              onChange={e => setPrompt(e.target.value)}
              required
            />
          </label>
          <Button type="submit" disabled={isMutating || !prompt.trim()}>
            Создать
          </Button>
        </form>
      ) : (
        <br />
      )}
    </>
  );
};

export default PromtGeneratorForm;
