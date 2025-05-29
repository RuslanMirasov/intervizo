import { Button } from '@/components';
import css from './InterviewButtons.module.scss';

const InterviewButtons = ({ _id }) => {
  return (
    <div className={css.InterviewButtons}>
      <Button className="small red">Удалить</Button>
      <Button className="small shere">Поделиться</Button>
      <Button href={`/interviews/${_id}/update`} className="small border">
        Редактировать
      </Button>
    </div>
  );
};

export default InterviewButtons;
