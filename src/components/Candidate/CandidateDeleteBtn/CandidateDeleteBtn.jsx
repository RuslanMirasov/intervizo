'use client';

import { Button } from '@/components';
import { usePopup } from '@/hooks/usePopup';
import useRequest from '@/hooks/useRequest';
import { useRouter } from 'next/navigation';

import { useState } from 'react';
import css from './CandidateDeleteBtn.module.scss';

const CandidateDeleteBtn = ({ id, interviewId }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { openPopup, closePopup } = usePopup();
  const { trigger } = useRequest({ url: `/api/candidate/${id}`, method: 'DELETE' });
  const { mutate } = useRequest({ url: `/api/candidate` });

  const deleteCandidate = async id => {
    setLoading(true);
    try {
      await trigger();
      await mutate();
      router.replace(`/interviews/${interviewId}`);
    } catch (error) {
      console.error('Ошибка при удалении кандидата:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = () => {
    if (!id) return;
    openPopup({
      type: 'confirm',
      title: 'Вы уверены?',
      subtitle: 'При удалении все данные кандидата будут безвозвратно удалены, включая медиа файлы.',
      button: 'Удалить',
      loading: loading,
      action: () => {
        deleteCandidate(id);
        closePopup();
      },
    });
  };

  return (
    <div className={css.CandidateDeleteBtn}>
      <Button className="small red" onClick={handleClick} loading={loading}>
        Удалить
      </Button>
    </div>
  );
};

export default CandidateDeleteBtn;
