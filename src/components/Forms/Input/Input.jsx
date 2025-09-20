'use client';

import { useState, useEffect } from 'react';
import clsx from 'clsx';
import css from './Input.module.scss';

const Input = ({ name, type, size, placeholder, onChange, value, label, checked, required, full, disabled }) => {
  const [inputValue, setInputValue] = useState('');
  const isToggle = type === 'checkbox' || type === 'radio';

  const classes = clsx(css.Input, {
    [css.Small]: size === 'small',
    [css.Full]: full,
  });

  useEffect(() => {
    if (!isToggle && value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value, isToggle]);

  const handleChange = e => {
    if (!isToggle) {
      setInputValue(e.target.value);
    }
    onChange?.(e);
  };

  return (
    <label className={`${css.InputLabel} ${disabled ? css.Disabled : ''}`}>
      {type !== 'radio' && type !== 'checkbox' && label && <span className={css.LabelText}>{label}</span>}

      <input
        type={type}
        name={name}
        {...(isToggle ? { value } : { value: inputValue })}
        {...(isToggle && checked !== undefined ? { checked } : {})}
        placeholder={placeholder}
        className={classes}
        onChange={handleChange}
        required={required}
        disabled={disabled}
      />

      {(type === 'radio' || type === 'checkbox') && label && <span className={css.RadioText}>{label}</span>}
    </label>
  );
};

export default Input;
