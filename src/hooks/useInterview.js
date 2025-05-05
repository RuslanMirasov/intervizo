import useLocalStorageState from 'use-local-storage-state';

const defaultInterview = {
  slug: '',
  name: '',
  category: '',
  description: '',
  thumbnail: '',
  duration: 20,
  difficulty: '',
  data: [],
};

export const useInterview = () => {
  const [interview, setInterview] = useLocalStorageState('interview', {
    defaultValue: defaultInterview,
  });

  return { interview, setInterview };
};
