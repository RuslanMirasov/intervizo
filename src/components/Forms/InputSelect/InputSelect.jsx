'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
const Select = dynamic(() => import('react-select'), { ssr: false });
import css from './InputSelect.module.scss';

const InputSelect = ({ name, options, placeholder, onChange, value }) => {
  const [selected, setSelected] = useState(null);

  // Если value явно передан — синхронизируем его (контролируемый режим)
  useEffect(() => {
    if (value !== undefined) {
      if (typeof value === 'object' && value?.value) {
        setSelected(value);
      } else {
        const match = options.find(opt => opt.value === value);
        setSelected(match || null);
      }
    }
  }, [value, options]);

  const handleChange = selectedOption => {
    setSelected(selectedOption);
    if (onChange) {
      onChange({
        target: {
          name,
          value: selectedOption?.value ?? '',
          label: selectedOption?.label ?? null,
          thumbnail: selectedOption?.thumbnail ?? null,
        },
      });
    }
  };

  return (
    <Select
      name={name}
      options={options}
      className={css.InputSelect}
      classNamePrefix="select"
      placeholder={placeholder}
      onChange={handleChange}
      value={selected}
    />
  );
};

export default InputSelect;
