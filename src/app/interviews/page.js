import { Suspense } from 'react';
import { Breadcrumbs, Section, InterviewCatalog } from '@/components';

const Interviews = () => {
  return (
    <Section intop width="1200px">
      <Suspense>
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Интервью' }]} />
        <Suspense>
          <InterviewCatalog />
        </Suspense>
      </Suspense>
    </Section>
  );
};

export default Interviews;
