import { Skeleton } from '@/components';
import css from './ResultsListSkeleton.module.scss';

const ResultsListSkeleton = () => {
  return (
    <div className={css.ResultsListSkeleton}>
      <div className={css.Item}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width="52px" height="52px" radius="12px" />
          <span>
            <Skeleton width="120px" height="14px" radius="4px" />
            <Skeleton width="80px" height="8px" radius="4px" margin="10px 0px 0px 0px" />
          </span>
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width="80px" height="14px" radius="8px" />
          <Skeleton width="36px" height="22px" radius="22px" />
        </span>
      </div>
      <div className={css.Item}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width="52px" height="52px" radius="12px" />
          <span>
            <Skeleton width="120px" height="14px" radius="4px" />
            <Skeleton width="80px" height="8px" radius="4px" margin="10px 0px 0px 0px" />
          </span>
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width="80px" height="14px" radius="8px" />
          <Skeleton width="36px" height="22px" radius="22px" />
        </span>
      </div>
      <div className={css.Item}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width="52px" height="52px" radius="12px" />
          <span>
            <Skeleton width="120px" height="14px" radius="4px" />
            <Skeleton width="80px" height="8px" radius="4px" margin="10px 0px 0px 0px" />
          </span>
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width="80px" height="14px" radius="8px" />
          <Skeleton width="36px" height="22px" radius="22px" />
        </span>
      </div>
      <div className={css.Item}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width="52px" height="52px" radius="12px" />
          <span>
            <Skeleton width="120px" height="14px" radius="4px" />
            <Skeleton width="80px" height="8px" radius="4px" margin="10px 0px 0px 0px" />
          </span>
        </span>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width="80px" height="14px" radius="8px" />
          <Skeleton width="36px" height="22px" radius="22px" />
        </span>
      </div>
    </div>
  );
};

export default ResultsListSkeleton;
