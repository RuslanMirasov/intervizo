// const fetcher = async (url, options = {}) => {
//   const finalOptions = { ...options };

//   const isFormData = options.body instanceof FormData;

//   finalOptions.headers = {
//     ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
//     ...(options.headers || {}),
//   };

//   const res = await fetch(url, finalOptions);

//   if (!res.ok) {
//     let errorBody = {};
//     try {
//       errorBody = await res.json();
//     } catch (_) {}

//     const error = new Error(errorBody.message || 'При запросе на сервер произошла ошибка');
//     error.status = res.status;
//     throw error;
//   }

//   return res.json();
// };

// export default fetcher;

const fetcher = async (url, options = {}) => {
  const finalOptions = { ...options };

  // Гарантируем куки для запросов к своему домену
  if (finalOptions.credentials === undefined) {
    finalOptions.credentials = 'same-origin';
  }

  const isFormData = finalOptions.body instanceof FormData;

  finalOptions.headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    Accept: 'application/json',
    ...(finalOptions.headers || {}),
  };

  const res = await fetch(url, finalOptions);
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    let errorBody = null;

    if (contentType.includes('application/json')) {
      try {
        errorBody = await res.json();
      } catch (_) {
        // игнорируем падение парсинга
      }
    }

    const message = (errorBody && (errorBody.error || errorBody.message)) || `HTTP ${res.status}`;

    const error = new Error(message || 'При запросе на сервер произошла ошибка');
    error.status = res.status;
    error.body = errorBody;
    throw error;
  }

  // Успех: если не JSON, поддерживаем 204/205, иначе считаем это ошибкой контента
  if (!contentType.includes('application/json')) {
    if (res.status === 204 || res.status === 205) return null;
    throw new Error('Non-JSON response');
  }

  return res.json();
};

export default fetcher;
