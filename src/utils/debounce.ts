export function debounce<T extends (...args: any[]) => void>(fn: T, delay = 250) {
  let timer: number | undefined;
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => void>(fn: T, interval = 250) {
  let last = 0;
  let trailingTimer: number | undefined;
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn(...args);
    } else {
      if (trailingTimer) window.clearTimeout(trailingTimer);
      trailingTimer = window.setTimeout(() => {
        last = Date.now();
        fn(...args);
      }, interval - (now - last));
    }
  };
}


