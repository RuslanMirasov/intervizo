import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { Section, Room, Preloader } from '@/components';
import { CameraProvider } from '@/context/CameraContext';
import { ProgressProvider } from '@/context/ProgressContext';

export const metadata = {
  title: 'InterVizo | Комната для собеседования',
  description: 'Интервьюер',
};

const RoomPage = async ({ params }) => {
  const { id } = await params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  return (
    <Section>
      <Suspense fallback={<Preloader />}>
        <ProgressProvider>
          <CameraProvider>
            <Room id={id} />
          </CameraProvider>
        </ProgressProvider>
      </Suspense>
    </Section>
  );
};

export default RoomPage;
