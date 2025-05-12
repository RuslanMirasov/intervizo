import { Button, Icon, RoomTime } from '@/components';
import { useProgressUi } from '@/context/ProgressUiContext';
import { useProgress } from '@/context/ProgressContext';
import css from './RoomButtons.module.scss';

const RoomButtons = () => {
  const { stepPhase } = useProgressUi();
  const { step, saveAnswer } = useProgress();
  return (
    <div className={css.Panel}>
      <RoomTime />

      {stepPhase !== 'answering' && (
        <Button href="./" className="small call">
          <Icon name="call" size="25" color="var(--white)" />
        </Button>
      )}

      {stepPhase === 'answering' && (
        <Button className="small white radius" onClick={() => saveAnswer(step)}>
          Следующий вопрос
        </Button>
      )}
    </div>
  );
};

export default RoomButtons;
