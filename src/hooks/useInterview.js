import useLocalStorageState from 'use-local-storage-state';

const defaultInterview = {
  company: 'my company',
  owners: ['info@mirasov.dev', 'hello@brainst.pro'],
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
  const [interview, setInterview, { isPersistent }] = useLocalStorageState('interview', {
    defaultValue: defaultInterview,
    ssr: false,
  });

  const [updates, setUpdates, { isPersistent: isUpdatesPersistent }] = useLocalStorageState('updates', {
    defaultValue: {},
    ssr: false,
  });

  const resetInterview = () => {
    setInterview(defaultInterview);
  };

  const resetUpdates = () => {
    setUpdates({});
  };

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
