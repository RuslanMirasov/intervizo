import { Skeleton } from '@/components';
import css from './InterviewListSkeleton.module.scss';

const InterviewListSkeleton = () => {
  return (
    <div className={css.Wrapper}>
      <ul className={css.InterviewList}>
        <li className={css.Item}>
          <div className={css.InterviewArticle}>
            <Skeleton width="100%" height="84px" radius="8px" />
            <Skeleton width="70%" height="16px" radius="4px" margin="0px 0px auto 0px" />
            <ul className={css.Info}>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
            </ul>
          </div>
        </li>
        <li className={css.Item}>
          <div className={css.InterviewArticle}>
            <Skeleton width="100%" height="84px" radius="8px" />
            <Skeleton width="70%" height="16px" radius="4px" margin="0px 0px auto 0px" />
            <ul className={css.Info}>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
            </ul>
          </div>
        </li>
        <li className={css.Item}>
          <div className={css.InterviewArticle}>
            <Skeleton width="100%" height="84px" radius="8px" />
            <Skeleton width="70%" height="16px" radius="4px" margin="0px 0px auto 0px" />
            <ul className={css.Info}>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
            </ul>
          </div>
        </li>
        <li className={css.Item}>
          <div className={css.InterviewArticle}>
            <Skeleton width="100%" height="84px" radius="8px" />
            <Skeleton width="70%" height="16px" radius="4px" margin="0px 0px auto 0px" />
            <ul className={css.Info}>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
            </ul>
          </div>
        </li>
        <li className={css.Item}>
          <div className={css.InterviewArticle}>
            <Skeleton width="100%" height="84px" radius="8px" />
            <Skeleton width="70%" height="16px" radius="4px" margin="0px 0px auto 0px" />
            <ul className={css.Info}>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
            </ul>
          </div>
        </li>
        <li className={css.Item}>
          <div className={css.InterviewArticle}>
            <Skeleton width="100%" height="84px" radius="8px" />
            <Skeleton width="70%" height="16px" radius="4px" margin="0px 0px auto 0px" />
            <ul className={css.Info}>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
            </ul>
          </div>
        </li>
        <li className={css.Item}>
          <div className={css.InterviewArticle}>
            <Skeleton width="100%" height="84px" radius="8px" />
            <Skeleton width="70%" height="16px" radius="4px" margin="0px 0px auto 0px" />
            <ul className={css.Info}>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
            </ul>
          </div>
        </li>
        <li className={css.Item}>
          <div className={css.InterviewArticle}>
            <Skeleton width="100%" height="84px" radius="8px" />
            <Skeleton width="70%" height="16px" radius="4px" margin="0px 0px auto 0px" />
            <ul className={css.Info}>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
              <li>
                <Skeleton width="65px" height="24px" radius="18px" />
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default InterviewListSkeleton;
