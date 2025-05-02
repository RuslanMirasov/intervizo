import { InterviewList, Section } from '@/components';
import Link from 'next/link';

const Interviews = () => {
  return (
    <Section intop width="1200px">
      <div className="titleBox">
        <h1>Все интерьвью</h1>
        <p>Выберите интервью или создайте свой</p>
      </div>
      <Link href="./" className="link">
        На главную
      </Link>
      <InterviewList />
    </Section>
  );
};

export default Interviews;
