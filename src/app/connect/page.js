import { Section, Connection } from '@/components';
import { CameraProvider } from '@/context/CameraContext';

export const metadata = {
  title: 'InterVizo | Подключение',
  description: 'Интервьюер',
};

const ConnectPage = () => {
  return (
    <Section width="924px">
      <CameraProvider>
        <Connection />
      </CameraProvider>
    </Section>
  );
};

export default ConnectPage;
