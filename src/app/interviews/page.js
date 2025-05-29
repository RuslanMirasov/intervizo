import { Suspense } from 'react';
import { Breadcrumbs, Section, InterviewCatalog } from '@/components';

const Interviews = () => {
  return (
    <Section intop width="1200px">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Интервью' }]} />
      <Suspense>
        <InterviewCatalog />
      </Suspense>
    </Section>
  );
};

export default Interviews;
