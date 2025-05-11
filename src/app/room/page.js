import { Section, Room } from '@/components';
import { CameraProvider } from '@/context/CameraContext';
import { ProgressProvider } from '@/context/ProgressContext';

export const metadata = {
  title: 'InterVizo | Комната для собеседования',
  description: 'Интервьюер',
};

const RoomPage = () => {
  return (
    <Section>
      <ProgressProvider>
        <CameraProvider>
          <Room />
        </CameraProvider>
      </ProgressProvider>
    </Section>
  );
};

export default RoomPage;
