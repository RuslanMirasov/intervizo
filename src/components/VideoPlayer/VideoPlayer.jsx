'use client';

import { useEffect, useState } from 'react';
import css from './VideoPlayer.module.scss';

const VideoPlayer = ({ url }) => {
  const [isValid, setIsValid] = useState(null); // null — неизвестно
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      setIsValid(false);
      setChecking(false);
      return;
    }

    let cancelled = false; // ты это пропустил

    setChecking(true);

    fetch(url, { method: 'HEAD' })
      .then(res => {
        if (!cancelled) setIsValid(res.ok);
      })
      .catch(() => {
        if (!cancelled) setIsValid(false);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (checking) {
    return (
      <div className={css.VideoPlayer}>
        <div className={css.Message}>
          <strong>Проверяем видео...</strong>
        </div>
      </div>
    );
  }

  if (!url || !isValid) {
    return (
      <div className={css.VideoPlayer}>
        <div className={css.Message}>
          <strong>Видео отсутствует</strong>
          <p>Возможно при сохранении произошёл сбой или&nbsp;видео было удалено.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={css.VideoPlayer}>
      {loading && (
        <div className={css.Message}>
          <strong>Загрузка видео...</strong>
        </div>
      )}

      <video
        key={url}
        src={url}
        controls
        controlsList="nodownload"
        playsInline
        preload="metadata"
        className={`${css.Player} ${loading ? css.Loading : ''}`}
        onError={() => setIsValid(false)}
        onLoadedData={() => setLoading(false)} // ← правильное событие
      />
    </div>
  );
};

export default VideoPlayer;
