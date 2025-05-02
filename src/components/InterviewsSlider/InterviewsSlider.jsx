import { Button, Icon } from '@/components';
import css from './InterviewsSlider.module.scss';

const InterviewsSlider = () => {
  return (
    <div className={css.InterviewsSlider}>
      <Button className="add">
        <Icon name="border" />
        <Icon name="plus" size="56" />
        Add
        <br />
        interview
      </Button>
      <div className={css.SliderWrapper}></div>
    </div>
  );
};

export default InterviewsSlider;
