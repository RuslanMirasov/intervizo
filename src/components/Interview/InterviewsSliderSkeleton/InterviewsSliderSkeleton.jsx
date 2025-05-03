import { Skeleton } from '@/components';
import css from './InterviewsSliderSkeleton.module.scss';

const InterviewsSliderSkeleton = () => {
  return (
    <div className={css.InterviewsSliderSkeleton}>
      <div className={css.Item}>
        <Skeleton width="100%" height="136px" radius="12px" />
        <div style={{ padding: '8px', marginBottom: 'auto' }}>
          <Skeleton width="90%" height="20px" radius="6px" />
          <Skeleton width="70%" height="10px" radius="4px" margin="16px 0px 0px 0px" />
          <Skeleton width="50%" height="10px" radius="4px" margin="8px 0px 0px 0px" />
        </div>
        <div style={{ padding: '8px', display: 'flex', gap: '12px' }}>
          <Skeleton width="70px" height="24px" radius="40px" />
          <Skeleton width="70px" height="24px" radius="40px" />
        </div>
      </div>
      <div className={css.Item}>
        <Skeleton width="100%" height="136px" radius="12px" />
        <div style={{ padding: '8px', marginBottom: 'auto' }}>
          <Skeleton width="90%" height="20px" radius="6px" />
          <Skeleton width="70%" height="10px" radius="4px" margin="16px 0px 0px 0px" />
          <Skeleton width="50%" height="10px" radius="4px" margin="8px 0px 0px 0px" />
        </div>
        <div style={{ padding: '8px', display: 'flex', gap: '12px' }}>
          <Skeleton width="70px" height="24px" radius="40px" />
          <Skeleton width="70px" height="24px" radius="40px" />
        </div>
      </div>
      <div className={css.Item}>
        <Skeleton width="100%" height="136px" radius="12px" />
        <div style={{ padding: '8px', marginBottom: 'auto' }}>
          <Skeleton width="90%" height="20px" radius="6px" />
          <Skeleton width="70%" height="10px" radius="4px" margin="16px 0px 0px 0px" />
          <Skeleton width="50%" height="10px" radius="4px" margin="8px 0px 0px 0px" />
        </div>
        <div style={{ padding: '8px', display: 'flex', gap: '12px' }}>
          <Skeleton width="70px" height="24px" radius="40px" />
          <Skeleton width="70px" height="24px" radius="40px" />
        </div>
      </div>
      <div className={css.Item}>
        <Skeleton width="100%" height="136px" radius="12px" />
        <div style={{ padding: '8px', marginBottom: 'auto' }}>
          <Skeleton width="90%" height="20px" radius="6px" />
          <Skeleton width="70%" height="10px" radius="4px" margin="16px 0px 0px 0px" />
          <Skeleton width="50%" height="10px" radius="4px" margin="8px 0px 0px 0px" />
        </div>
        <div style={{ padding: '8px', display: 'flex', gap: '12px' }}>
          <Skeleton width="70px" height="24px" radius="40px" />
          <Skeleton width="70px" height="24px" radius="40px" />
        </div>
      </div>
    </div>
  );
};

export default InterviewsSliderSkeleton;
