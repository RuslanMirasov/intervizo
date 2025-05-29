import { Section, Breadcrumbs, AddNewInterviewForm } from '@/components';

export const metadata = {
  title: 'InterVizo | Добавить интервью',
  description: 'Интервьюер',
};

const AddNewInterview = () => {
  return (
    <Section intop width="860px">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Добавить интервью' }]} />
      <AddNewInterviewForm />
    </Section>
  );
};

export default AddNewInterview;
