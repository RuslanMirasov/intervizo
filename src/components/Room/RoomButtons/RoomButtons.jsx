import { Button, Icon, RoomTime } from '@/components';
import { useProgressUi } from '@/context/ProgressUiContext';
//import { useProgress } from '@/context/ProgressContext';
import css from './RoomButtons.module.scss';

const RoomButtons = () => {
  const { showNextButton, saveAnswer } = useProgressUi();
  return (
    <div className={css.Panel}>
      <RoomTime />

      <Button href="./" className="small call">
        <Icon name="call" size="25" color="var(--white)" />
      </Button>

      {showNextButton && (
        <Button className="small white radius nextQuestion" onClick={() => saveAnswer()}>
          Следующий вопрос
        </Button>
      )}
    </div>
  );
};

export default RoomButtons;
