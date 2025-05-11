let interval = null;

export const startCountdown = (seconds = null, callback = null, onTick = null) => {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }

  if (seconds == null || typeof callback !== 'function') return;

  let remaining = seconds;

  if (typeof onTick === 'function') {
    onTick(remaining);
  }

  interval = setInterval(() => {
    remaining -= 1;

    if (remaining > 0) {
      onTick(remaining);
    } else {
      clearInterval(interval);
      interval = null;
      onTick(null);
      callback();
    }
  }, 1000);
};
