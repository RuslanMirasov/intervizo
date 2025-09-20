export const extractErrorMessage = error => {
  if (!error) return 'Неизвестная ошибка';

  if (typeof error === 'string') return error;

  if (error.message) return error.message;

  if (error.response?.data?.message) return error.response.data.message;

  try {
    return JSON.stringify(error);
  } catch {
    return 'Неизвестная ошибка';
  }
};
