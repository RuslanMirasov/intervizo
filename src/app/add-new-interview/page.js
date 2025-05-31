import { Suspense } from 'react';
import { Section, Breadcrumbs, AddNewInterviewForm } from '@/components';

export const metadata = {
  title: 'InterVizo | Редактор',
  description: 'Интервьюер',
};

const AddNewInterview = async ({ searchParams }) => {
  const { id = null } = await searchParams;

  return (
    <Section intop width="900px">
      <Breadcrumbs
        items={[{ label: 'Главная', href: '/' }, { label: id ? 'Редактор интервью' : 'Добавить интервью' }]}
      />
      <Suspense>
        <AddNewInterviewForm id={id} />
      </Suspense>
    </Section>
  );
};

export default AddNewInterview;
