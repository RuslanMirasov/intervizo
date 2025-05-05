const fetcher = async (url, options = {}) => {
  const finalOptions = { ...options };

  const isFormData = options.body instanceof FormData;

  finalOptions.headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const res = await fetch(url, finalOptions);

  if (!res.ok) {
    let errorBody = {};
    try {
      errorBody = await res.json();
    } catch (_) {}

    const error = new Error(errorBody.message || 'При запросе на сервер произошла ошибка');
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export default fetcher;
