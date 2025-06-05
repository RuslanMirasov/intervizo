export const preloadMedia = urls => {
  if (!Array.isArray(urls)) throw new Error('preloadMedia expects an array of URLs');

  const preloadSingle = url => {
    return new Promise((resolve, reject) => {
      const isAudio = url.match(/\.(mp3|wav|ogg)(\?.*)?$/i);
      const isVideo = url.match(/\.(mp4|webm|ogg)(\?.*)?$/i);

      if (!isAudio && !isVideo) {
        reject(new Error(`Unsupported media type: ${url}`));
        return;
      }

      const media = isAudio ? new Audio() : document.createElement('video');

      media.src = url;
      media.preload = 'auto';
      media.muted = true;
      media.playsInline = true;

      const onReady = () => resolve(media);
      const onError = () => reject(new Error(`Failed to preload media: ${url}`));

      media.addEventListener('canplay', onReady, { once: true });
      media.addEventListener('error', onError, { once: true });
    });
  };

  return Promise.all(urls.map(preloadSingle));
};
