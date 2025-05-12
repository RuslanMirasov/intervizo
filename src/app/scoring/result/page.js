import { Section, ScoringResult } from '@/components';

export const metadata = {
  title: 'InterVizo | Результат скорирования интервью',
  description: 'Результат скорирования интервью',
};

const ScoringResultPage = () => {
  return (
    <Section intop width="594px">
      <ScoringResult />
    </Section>
  );
};

export default ScoringResultPage;
