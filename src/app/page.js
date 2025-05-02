import { Section, InterviewsSlider, ResultsList } from '@/components';
import Link from 'next/link';

const Home = () => {
  return (
    <>
      <Section intop width="1200px">
        <div className="titleBox">
          <h1>Добро пожаловать</h1>
          <p>Выберите интервью или создайте свой</p>
        </div>

        <Link href="./interviews" className="link">
          Смотреть все интервью
        </Link>

        <InterviewsSlider />
        <ResultsList />
      </Section>
    </>
  );
};

export default Home;
