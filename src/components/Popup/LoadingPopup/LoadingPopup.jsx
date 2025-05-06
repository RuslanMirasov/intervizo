import { Flex, Preloader } from '@/components';
import css from './LoadingPopup.module.scss';

const LoadingPopup = ({ params }) => {
  const { title, subtitle } = params;
  return (
    <div className={css.LoadingPopup}>
      <Flex>
        {title && <h3>{title}</h3>}
        <Preloader />
        {subtitle && <p>{subtitle}</p>}
      </Flex>
    </div>
  );
};

export default LoadingPopup;
