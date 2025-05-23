import { useProgress } from '@/context/ProgressContext';
import css from './RoomQuestion.module.scss';

const RoomQuestion = ({ interview }) => {
  const { step } = useProgress();
  const { data } = interview;

  if (!data || data.length === 0) return null;

  return (
    <>
      <p className={css.You}>Вы</p>
      {step !== null && (
        <div className={css.RoomQuestion}>
          <p>{data[step]?.text}</p>
        </div>
      )}
    </>
  );
};

export default RoomQuestion;
