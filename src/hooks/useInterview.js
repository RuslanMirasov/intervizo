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

  return { interview, setInterview, isPersistent };
};
