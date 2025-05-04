import { Button, Icon } from '@/components';
import { usePopup } from '@/hooks/usePopup';
import css from './AddSectionPopup.module.scss';

const AddSectionPopup = ({ params }) => {
  const { addSection } = params;
  const { closePopup } = usePopup();

  const handleClick = type => {
    addSection(type);
    closePopup();
  };

  return (
    <div className={css.AddSectionPopup}>
      <Button className="grey" onClick={() => handleClick('message')}>
        <Icon name="message" size="20" color="currentColor" />
        Сообщение
      </Button>
      <Button className="grey" onClick={() => handleClick('question')}>
        <Icon name="question" size="20" color="currentColor" />
        Вопрос
      </Button>
    </div>
  );
};

export default AddSectionPopup;
