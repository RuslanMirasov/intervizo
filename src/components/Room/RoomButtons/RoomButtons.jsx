import { Button, Icon, RoomTime } from '@/components';
import { useProgressUi } from '@/context/ProgressUiContext';
import css from './RoomButtons.module.scss';

const RoomButtons = () => {
  const { stepPhase } = useProgressUi();
  return (
    <div className={css.Panel}>
      <RoomTime />

      {stepPhase === 'answering' && <Button className="small">Принять мой ответ</Button>}

      {stepPhase !== 'answering' && (
        <Button href="./" className="small call">
          <Icon name="call" size="25" color="var(--white)" />
        </Button>
      )}
    </div>
  );
};

export default RoomButtons;
