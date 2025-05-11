import { Preloader } from '@/components';
import { useProgressUi } from '@/context/ProgressUiContext';
import css from './RoomPanel.module.scss';

const RoomPanel = () => {
  const { stepPhase, loading, countdown } = useProgressUi();
  return (
    <div className={`${css.Robot} ${loading ? css.Loading : ''}`}>
      <Preloader className={css.RoomPreloader} />
      {stepPhase === 'thinking' && countdown > 0 && countdown < 6 && <div className={css.Counter}>{countdown}</div>}

      <span>InterVizo</span>
    </div>
  );
};

export default RoomPanel;
