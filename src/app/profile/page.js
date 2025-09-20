import { Section, Breadcrumbs, ProfileButtons, ProfileHeader } from '@/components';

export const metadata = {
  title: 'InterVizo | Личный кабинет',
  description: 'Личный кабинет',
};

const ProfilePage = () => {
  return (
    <Section intop width="1200px">
      <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Профиль' }]} />
      <ProfileButtons />
      <ProfileHeader />
    </Section>
  );
};

export default ProfilePage;
