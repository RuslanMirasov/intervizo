'use client';

import { Button } from '@/components';
import css from './PromtGeneratorForm.module.scss';

const PromtGeneratorForm = () => {
  return (
    <form className={css.PromtGeneratorForm}>
      <span>
        Вы можете воспользоваться ИИ-ассистентом — он добавит необходимые вопросы. <br />
        Также вы сможете редактировать их далее.
      </span>
      <label>
        <input type="text" name="promt" placeholder="Для какой должности хотели бы провести интервью" />
      </label>
      <Button type="submit">Создать</Button>
    </form>
  );
};

export default PromtGeneratorForm;
