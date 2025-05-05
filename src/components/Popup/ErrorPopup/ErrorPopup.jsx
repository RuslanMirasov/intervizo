import { Button } from '@/components';
import css from './ErrorPopup.module.scss';

const ErrorPopup = ({ params }) => {
  const { status, message, closePopup } = params;

  return (
    <div className={css.ErrorPopup}>
      {status && <h2>Ошибка {status}</h2>}
      {message && <p>{message}</p>}

      <Button className="small white" onClick={closePopup}>
        Закрыть
      </Button>
    </div>
  );
};

export default ErrorPopup;
