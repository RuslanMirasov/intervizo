'use client';

import { validateForm } from '@/lib/validateForm';
import { useEffect } from 'react';

const serializeForm = form => {
  const fd = new FormData(form);
  const data = {};
  for (const [key, value] of fd.entries()) {
    if (key in data) {
      if (Array.isArray(data[key])) data[key].push(value);
      else data[key] = [data[key], value];
    } else {
      data[key] = value;
    }
  }
  return data;
};

export default function useFormValidation() {
  useEffect(() => {
    const onSubmit = e => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement)) return;

      const required = [...form.querySelectorAll('[required]')];

      if (required.length > 0) {
        const isFormValid = validateForm(form);
        if (!isFormValid) {
          e.preventDefault();
          e.stopImmediatePropagation?.();
          return;
        }
      }

      e.formData = serializeForm(form);
    };

    document.addEventListener('submit', onSubmit, true);
    return () => document.removeEventListener('submit', onSubmit, true);
  }, []);
}
