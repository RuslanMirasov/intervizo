import { Suspense } from 'react';
import { Section, InterviewsSlider, ResultsList } from '@/components';

const Home = () => {
  return (
    <Section intop width="1200px">
      <InterviewsSlider />
      <Suspense>
        <ResultsList />
      </Suspense>
    </Section>
  );
};

export default Home;
