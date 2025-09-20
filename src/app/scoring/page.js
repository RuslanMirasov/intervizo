import { Section, Scoring } from '@/components';

export const metadata = {
  title: 'InterVizo | Скорирование интервью',
  description: 'Скорирование интервью',
};

const ScoringPage = () => {
  return (
    <Section width="340px">
      <Scoring />
    </Section>
  );
};

export default ScoringPage;
