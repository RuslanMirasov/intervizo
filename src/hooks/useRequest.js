import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import fetcher from '@/lib/fetcher';
import { usePopup } from '@/hooks/usePopup';

const useRequest = ({ url, method = 'GET', data = null, options = {}, showPopup = true }) => {
  const { openPopup, closePopup } = usePopup();
  const isGet = method.toUpperCase() === 'GET';

  const swr = useSWR(
    isGet ? url : null,
    async url => {
      try {
        return await fetcher(url);
      } catch (error) {
        if (showPopup) {
          openPopup({
            type: 'error',
            status: error.status,
            message: error.message,
            closePopup,
          });
        }
        throw error;
      }
    },
    options
  );

  const mutation = useSWRMutation(
    !isGet ? url : null,
    async (url, { arg }) => {
      try {
        return await fetcher(url, {
          method,
          body: data instanceof FormData ? data : JSON.stringify(arg || data),
        });
      } catch (error) {
        if (showPopup) {
          openPopup({
            type: 'error',
            status: error.status,
            message: error.message,
            closePopup,
          });
        }
        throw error;
      }
    },
    options
  );

  return isGet
    ? {
        data: swr.data,
        error: swr.error,
        isLoading: swr.isLoading,
        isValidating: swr.isValidating,
        mutate: swr.mutate,
      }
    : {
        data: null,
        error: null,
        trigger: mutation.trigger,
        isMutating: mutation.isMutating,
      };
};

export default useRequest;
