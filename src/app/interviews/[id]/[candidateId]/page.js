import { notFound } from 'next/navigation';
import { Breadcrumbs, Section, CandidateSingle, CandidateDeleteBtn } from '@/components';

export const metadata = {
  title: 'InterVizo | Результат кандидата',
  description: 'Интервьюер',
};

async function getCandidate(id) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/candidate/${id}`);
  return res.json();
}

const CandidateSinglePage = async ({ params }) => {
  const { candidateId } = await params;
  const { candidate } = await getCandidate(candidateId);

  if (!candidate) return notFound();

  const { _id, interviewId, name, position } = candidate;

  return (
    <Section intop width="580px">
      <Breadcrumbs
        items={[
          { label: 'Главная', href: '/' },
          { label: 'Интервью', href: `/interviews` },
          { label: position, href: `/interviews/${interviewId}` },
          { label: name },
        ]}
      />
      <CandidateDeleteBtn id={_id} interviewId={interviewId} />
      <CandidateSingle candidate={candidate} />
    </Section>
  );
};

export default CandidateSinglePage;
