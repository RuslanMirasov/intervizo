import { Breadcrumbs, Section, InterviewCatalog } from '@/components';

const Interviews = () => {
  return (
    <Section intop width="1200px">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Интервью' }]} />
      <InterviewCatalog />
    </Section>
  );
};

export default Interviews;
