import { Section } from '@/components';
import Link from 'next/link';

const Interviews = () => {
  return (
    <Section intop>
      <>
        <h1>Все интерьвью</h1>
      </>
      <Link href="./" className="link">
        На главную
      </Link>
    </Section>
  );
};

export default Interviews;
