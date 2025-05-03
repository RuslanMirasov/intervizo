import { Button } from '@/components';
import css from './AddNewInterviewForm.module.scss';

const AddNewInterviewForm = () => {
  return (
    <form className={css.AddNewInterviewForm} noValidate>
      <input type="text" name="name" placeholder="Введите название" />
      <textarea name="descrition" placeholder="Введите описание вакансии"></textarea>
      <fieldset>
        <Button className="small border full">+ Добавить секцию</Button>
      </fieldset>
    </form>
  );
};

export default AddNewInterviewForm;
