'use client';

import { useState, useEffect } from 'react';
import css from './Input.module.scss';

const Input = ({ name, type, size, placeholder, onChange, invalid, value }) => {
  const [inputValue, setInputValue] = useState('');

  const classes = [css.Input, size === 'small' && css.Small, invalid && css.Invalid].filter(Boolean).join(' ');

  useEffect(() => {
    setInputValue(value ?? '');
  }, [value]);

  const handleChange = e => {
    e.preventDefault();
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <label className={css.InputLabel}>
      <input
        type={type}
        name={name}
        value={inputValue}
        placeholder={placeholder}
        className={classes}
        onChange={handleChange}
      />
    </label>
  );
};

export default Input;
