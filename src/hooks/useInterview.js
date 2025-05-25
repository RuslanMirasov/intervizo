import useLocalStorageState from 'use-local-storage-state';

const defaultInterview = {
  slug: '',
  name: '',
  category: '',
  description: '',
  thumbnail: '',
  duration: '',
  difficulty: '',
  data: [],
};

export const useInterview = () => {
  const [interview, setInterview, { isPersistent }] = useLocalStorageState('interview', {
    defaultValue: defaultInterview,
    ssr: false,
  });

  return { interview, setInterview, isPersistent };
};
