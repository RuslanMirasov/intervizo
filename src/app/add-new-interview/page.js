import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Section, Breadcrumbs, AddNewInterviewForm } from '@/components';

export const metadata = {
  title: 'InterVizo | Редактор',
  description: 'Интервьюер',
};

async function getInterview(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/interview/${id}`);
  return res.json();
}

const AddNewInterview = async ({ searchParams }) => {
  const { id = null } = await searchParams;
  const { interview = null } = await getInterview(id);

  if (id && !interview) notFound();

  return (
    <Section intop width="900px">
      <Breadcrumbs
        items={[{ label: 'Главная', href: '/' }, { label: interview ? 'Редактор интервью' : 'Добавить интервью' }]}
      />
      <Suspense>
        <AddNewInterviewForm currentInterview={interview} />
      </Suspense>
    </Section>
  );
};

export default AddNewInterview;
