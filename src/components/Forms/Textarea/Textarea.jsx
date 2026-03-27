'use client';

import { useEffect, useRef } from 'react';

const resizeTextarea = el => {
  if (!el) return;

  el.style.height = '0px';
  const newHeight = el.scrollHeight;
  el.style.height = newHeight + 'px';
};

const Textarea = ({ value = '', onChange, name, placeholder }) => {
  const ref = useRef(null);

  // resize при изменении value
  useEffect(() => {
    resizeTextarea(ref.current);
  }, [value]);

  // resize при изменении размера окна / ориентации
  useEffect(() => {
    const handleResize = () => {
      resizeTextarea(ref.current);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const handleChange = e => {
    onChange?.(e);
    resizeTextarea(e.target);
  };

  return <textarea ref={ref} name={name} placeholder={placeholder} value={value} onChange={handleChange} />;
};

export default Textarea;
