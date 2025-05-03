import { Section, Button, Breadcrumbs, AddNewInterviewForm } from '@/components';

export const metadata = {
  title: 'InterVizo | Добавить интервью',
  description: 'Интервьюер',
};

const AddNewInterview = () => {
  return (
    <Section intop width="860px">
      <Breadcrumbs />

      <Button className="small border" disabled>
        Тестовое интервью
      </Button>

      <AddNewInterviewForm />

      {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start', width: '100%' }}>
        <Button href="./">Создать</Button>

        <Button href="./" className="small border full">
          + Добавить секцию
        </Button>
        <Button href="./" className="grey">
          <Icon name="message" size="15" color="currentColor" />
          Сообщение
        </Button>
        <Button href="./" className="grey">
          <Icon name="question" size="15" color="currentColor" />
          Вопрос
        </Button>
        <Button href="./" className="grey color">
          <Icon name="plus-btn" size="15" color="currentColor" />
          добавить
          <br />
          секцию
        </Button>
        <Button href="./" className="small red">
          Удалить
        </Button>
      </div> */}
    </Section>
  );
};

export default AddNewInterview;
