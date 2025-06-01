import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { Section, Connection, Preloader } from '@/components';
import { CameraProvider } from '@/context/CameraContext';

export const metadata = {
  title: 'InterVizo | Подключение',
  description: 'Интервьюер',
};

const ConnectUserPage = async ({ params }) => {
  const { id } = await params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  return (
    <Section width="924px">
      <Suspense fallback={<Preloader />}>
        <CameraProvider>
          <Connection id={id} />
        </CameraProvider>
      </Suspense>
    </Section>
  );
};

export default ConnectUserPage;
