'use client';

import { useState } from 'react';
import css from './Form.module.scss';

const Form = ({ children, onSubmit }) => {
  const [resetKey, setResetKey] = useState(0);

  const handlerSubmit = async e => {
    e.preventDefault();

    try {
      const result = await Promise.resolve(onSubmit(e));
      if (result !== false) {
        setResetKey(k => k + 1);
      }
    } catch {
      onSubmit(e);
    }
  };

  return (
    <form key={resetKey} className={css.Form} noValidate onSubmit={handlerSubmit}>
      {children}
    </form>
  );
};

export default Form;
