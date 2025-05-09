import { Button, Icon } from '@/components';
import { usePopup } from '@/hooks/usePopup';
import css from './MessagePopup.module.scss';

const MessagePopup = ({ params }) => {
  const { title, message, action } = params;
  const { closePopup } = usePopup();

  return (
    <div className={css.MessagePopup}>
      <button onClick={closePopup} className={css.Close}>
        <Icon name="close" />
      </button>

      {title && <h2>{title}</h2>}
      {message && <p>{message}</p>}

      <Button onClick={action}>
        <Icon name="sound" />
        Прослушать
      </Button>
    </div>
  );
};

export default MessagePopup;
