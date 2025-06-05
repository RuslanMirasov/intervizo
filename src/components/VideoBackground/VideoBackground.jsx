'use client';
import { useVideo } from '@/context/VideoContext';

import css from './VideoBackground.module.scss';

const VideoBackground = () => {
  const { videoRef, src, visible, loop, onEnded } = useVideo();
  return (
    <div className={css.VideoBackground}>
      <video src="/video/background.mp4" autoPlay loop muted playsInline />

      <video
        ref={videoRef}
        src={src}
        muted={loop}
        playsInline
        loop={loop}
        onEnded={onEnded}
        className={`${css.OverlayVideo} ${visible ? css.Visible : ''}`}
      />
    </div>
  );
};

export default VideoBackground;
