export function throttle(func, delay) {
  let lastCallTime = 0;
  let timeoutId;

  const throttledFunction = (...args) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= delay) {
      lastCallTime = now;
      func.apply(this, args);
    }
  };

  throttledFunction.cancel = () => {
    clearTimeout(timeoutId);
    lastCallTime = 0;
  };

  return throttledFunction;
}
