import { Button, Icon } from '@/components';
import { usePopup } from '@/hooks/usePopup';
import css from './ConfirmPopup.module.scss';

const ConfirmPopup = ({ params }) => {
  const { title, subtitle, button = null, action } = params;
  const { closePopup } = usePopup();

  return (
    <div className={css.ConfirmPopup}>
      <button onClick={closePopup} className={css.Close}>
        <Icon name="close" />
      </button>
      {title && <h2>{title}</h2>}
      {subtitle && <p className={css.Subtitle}>{subtitle}</p>}
      <div className={css.Buttons}>
        {button && (
          <Button className="small red" onClick={action}>
            {button}
          </Button>
        )}
        <Button className="small border " onClick={closePopup}>
          Закрыть
        </Button>
      </div>
    </div>
  );
};

export default ConfirmPopup;
