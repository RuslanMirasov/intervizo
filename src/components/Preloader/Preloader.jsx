import { Icon } from '@/components';
import css from './Preloader.module.scss';

const Preloader = ({ className }) => {
  return (
    <div className={`${css.Preloader} ${className ? className : ''}`}>
      <div className={css.Logo}>
        <Icon name="logo" />
      </div>
      <svg className={css.Spinner} viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="28" cy="28" r="27" stroke="currentColor" strokeWidth="2" />
      </svg>
    </div>
  );
};

export default Preloader;
