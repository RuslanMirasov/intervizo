'use client';

import { useEffect } from 'react';
import css from './Camera.module.scss';

const Camera = ({ videoRef, startCamera, stopCamera, error }) => {
  useEffect(() => {
    startCamera?.();
    return () => {
      stopCamera?.();
    };
  }, [startCamera, stopCamera]);

  return (
    <div className={css.Camera}>
      {error && <p>{error}</p>}
      <video ref={videoRef} autoPlay playsInline muted />
    </div>
  );
};

export default Camera;
