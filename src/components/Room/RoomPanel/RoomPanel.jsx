import { VideoBackground } from '@/components';
import { useProgressUi } from '@/context/ProgressUiContext';
import css from './RoomPanel.module.scss';

const RoomPanel = () => {
  const { loading, countdown } = useProgressUi();
  return (
    <>
      <div className={`${css.Robot} ${loading ? css.Loading : ''}`}>
        <VideoBackground />

        <span>InterVizo</span>
      </div>

      {countdown > 0 && <div className={css.Counter}>{countdown}</div>}
    </>
  );
};

export default RoomPanel;
