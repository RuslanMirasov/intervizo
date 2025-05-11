'use client';

import { useEffect } from 'react';
import { useCamera } from '@/context/CameraContext';
import css from './Camera.module.scss';

const Camera = () => {
  const { videoRef, startCamera, stopCamera, error } = useCamera();
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
