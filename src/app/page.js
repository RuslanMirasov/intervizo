import { Section, InterviewsSlider, Button, Icon } from '@/components';
import Link from 'next/link';

const Home = () => {
  return (
    <Section intop>
      <div>
        <h1>Добро пожаловать</h1>
        <p>Выберите интервью или создайте свой</p>
      </div>

      <Link href="./interviews" className="link">
        Смотреть все интервью
      </Link>

      <InterviewsSlider />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'flex-start', width: '100%' }}>
        <Button href="./">Создать</Button>
        <Button href="./" className="small border">
          Тестовое интервью
        </Button>
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
      </div>
    </Section>
  );
};

export default Home;
