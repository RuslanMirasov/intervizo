import { Icon, Preloader } from '@/components';
import css from './ProgressBar.module.scss';

const ProgressBar = ({ progress, procent = 100 }) => {
  return (
    <div className={css.ProgressBar}>
      <ul className={css.ProgressItems}>
        {progress.map((item, index) => (
          <li key={index} className={item.status}>
            <span>{item.name}</span>
            <span>
              {item.status === 'fullfield' && <Icon name="ok" size="12" />}
              {item.status === 'rejected' && <Icon name="close" size="12" />}
              {item.status === 'pending' && <div className={css.Spinner}></div>}
            </span>
          </li>
        ))}
      </ul>

      {/* <Preloader /> */}

      <div className={css.Progress}>
        <div className={css.Range} style={{ width: `${procent}%` }}></div>
        <span style={{ color: procent > 50 ? 'white' : 'var(--grey)' }}>{procent}%</span>
      </div>
    </div>
  );
};

export default ProgressBar;
