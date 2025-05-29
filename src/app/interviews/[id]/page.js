import { notFound } from 'next/navigation';
import { Breadcrumbs, Section, InterviewSingle, Button, InterviewButtons } from '@/components';

async function getInterview(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/interview/${id}`);
  return res.json();
}

const InterviewSinglePage = async ({ params }) => {
  const { id } = await params;
  const { interview } = await getInterview(id);

  if (!interview) return notFound();

  const { _id, name } = interview;

  return (
    <Section intop width="1200px">
      <Breadcrumbs
        items={[{ label: 'Главная', href: '/' }, { label: 'Интервью', href: '/interviews' }, { label: name }]}
      />
      <InterviewButtons _id={_id} />
      <InterviewSingle interview={interview} />
    </Section>
  );
};

export default InterviewSinglePage;
