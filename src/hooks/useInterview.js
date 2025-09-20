import useLocalStorageState from 'use-local-storage-state';
import { useSession } from 'next-auth/react';

const interviewTemplate = {
  company: null,
  owners: [],
  slug: '',
  name: '',
  category: '',
  description: '',
  thumbnail: '',
  duration: null,
  difficulty: '',
  video: '',
  data: [],
};

export const useInterview = () => {
  const { data: session } = useSession();

  const [interview, setInterview, { isPersistent }] = useLocalStorageState('interview', {
    defaultValue: { ...interviewTemplate, company: session?.user?.id || null, owners: [session?.user?.email] },
    ssr: false,
  });

  const [updates, setUpdates, { isPersistent: isUpdatesPersistent }] = useLocalStorageState('updates', {
    defaultValue: {},
    ssr: false,
  });

  const resetInterview = () => setInterview(interviewTemplate);
  const resetUpdates = () => setUpdates({});

  if (session?.user?.id && interview.company !== session.user.id) {
    setInterview(prev => ({
      ...prev,
      company: session.user.id,
      owners: session.user.email ? [session.user.email] : [],
    }));
  }

  return {
    interview,
    updates,
    isPersistent,
    isUpdatesPersistent,
    setInterview,
    setUpdates,
    resetInterview,
    resetUpdates,
  };
};
