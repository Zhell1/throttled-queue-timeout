declare function throttledQueue(maxRequestsPerInterval: number, interval: number, evenlySpaced?: boolean, timeToLive?: number): <Return = unknown>(fn: () => Return | Promise<Return>) => Promise<Return>;
export default throttledQueue;
//# sourceMappingURL=throttledQueue.d.ts.map