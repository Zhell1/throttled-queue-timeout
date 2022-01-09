export default function throttledQueue(
  maxRequestsPerInterval: number,
  interval: number,
  evenlySpaced = false,
) {
  /**
   * If all requests should be evenly spaced, adjust to suit.
   */
  if (evenlySpaced) {
    interval = interval / maxRequestsPerInterval;
    maxRequestsPerInterval = 1;
  }
  if (interval < 200) {
    console.warn('An interval of less than 200ms can create performance issues.');
  }
  const queue: Array<() => Promise<void>> = [];
  let lastCalled = Date.now();
  let timeout: number | undefined;

  /**
   * Gets called at a set interval to remove items from the queue.
   * This is a self-adjusting timer, since the browser's setTimeout is highly inaccurate.
   */
  const dequeue = () => {
    const threshold = lastCalled + interval;
    const now = Date.now();
    /**
     * Adjust the timer if it was called too early.
     */
    if (now < threshold) {
      clearTimeout(timeout);
      timeout = setTimeout(dequeue, threshold - now);
      return;
    }
    for (const callback of queue.splice(0, maxRequestsPerInterval)) {
      callback.call({});
    }
    lastCalled = Date.now();
    if (queue.length) {
      timeout = setTimeout(dequeue, interval);
    } else {
      timeout = undefined;
    }
  };

  return <Return = unknown>(fn: () => Promise<Return> | Return): Promise<Return> => new Promise<Return>(
    (resolve, reject) => {
      queue.push(() => Promise.resolve().then(fn).then(resolve).catch(reject));
      if (!timeout) {
        timeout = setTimeout(dequeue, interval);
      }
    },
  );
}
