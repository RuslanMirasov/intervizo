'use client';
import { Button } from '@/components';
import { useInterview } from '@/hooks/useInterview';
import { usePopup } from '@/hooks/usePopup';

const AddNewInterviewButtons = () => {
  const { openPopup } = usePopup();
  const { interview } = useInterview();

  const handleSaveInterview = async () => {
    openPopup({
      type: 'progress',
      locked: true,
    });
  };

  if (!interview) return null;

  return (
    <Button className="small" disabled={interview?.data?.length <= 0} onClick={handleSaveInterview}>
      Сохранить
    </Button>
  );
};

export default AddNewInterviewButtons;
