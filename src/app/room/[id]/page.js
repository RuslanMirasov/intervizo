import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import mongoose from 'mongoose';
import { Section, Room, Preloader } from '@/components';
import { CameraProvider } from '@/context/CameraContext';
import { ProgressProvider } from '@/context/ProgressContext';
import { VideoProvider } from '@/context/VideoContext';

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
        <VideoProvider key={id}>
          <CameraProvider>
            <ProgressProvider>
              <Room id={id} />
            </ProgressProvider>
          </CameraProvider>
        </VideoProvider>
      </Suspense>
    </Section>
  );
};

export default RoomPage;
