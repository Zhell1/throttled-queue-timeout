"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var timeout_queue_1 = __importDefault(require("timeout-queue"));
function throttledQueue(maxRequestsPerInterval, interval, evenlySpaced, timeToLive) {
    if (evenlySpaced === void 0) { evenlySpaced = false; }
    if (timeToLive === void 0) { timeToLive = -1; }
    /**
     * If all requests should be evenly spaced, adjust to suit.
     */
    if (evenlySpaced) {
        interval = interval / maxRequestsPerInterval;
        maxRequestsPerInterval = 1;
    }
    var Canceller = /** @class */ (function () {
        function Canceller() {
        }
        Canceller.prototype.cancel = function () { };
        return Canceller;
    }());
    var cancelToken = new Canceller();
    function ifExpired() {
        cancelToken.cancel();
    }
    var queue = (0, timeout_queue_1.default)(timeToLive, ifExpired);
    var lastIntervalStart = 0;
    var numRequestsPerInterval = 0;
    var timeout;
    /**
     * Gets called at a set interval to remove items from the queue.
     * This is a self-adjusting timer, since the browser's setTimeout is highly inaccurate.
     */
    var dequeue = function () {
        var intervalEnd = lastIntervalStart + interval;
        var now = Date.now();
        /**
         * Adjust the timer if it was called too early.
         */
        if (now < intervalEnd) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            timeout !== undefined && clearTimeout(timeout);
            timeout = setTimeout(dequeue, intervalEnd - now);
            return;
        }
        lastIntervalStart = now;
        numRequestsPerInterval = 0;
        for (var i = 0; i < maxRequestsPerInterval; i++) {
            var callback = queue.next();
            numRequestsPerInterval++;
            void callback();
        }
        if (queue.length) {
            timeout = setTimeout(dequeue, interval);
        }
        else {
            timeout = undefined;
        }
    };
    return function (fn) { return new Promise(function (resolve, reject) {
        cancelToken.cancel = function () {
            reject(new Error('Cancelled due to timeout'));
        };
        var callback = function () { return Promise.resolve().then(fn).then(resolve).catch(reject); };
        var now = Date.now();
        if (timeout === undefined && (now - lastIntervalStart) > interval) {
            lastIntervalStart = now;
            numRequestsPerInterval = 0;
        }
        if (numRequestsPerInterval++ < maxRequestsPerInterval) {
            void callback();
        }
        else {
            queue.push(callback);
            if (timeout === undefined) {
                timeout = setTimeout(dequeue, lastIntervalStart + interval - now);
            }
        }
    }); };
}
module.exports = throttledQueue;
exports.default = throttledQueue;
//# sourceMappingURL=throttledQueue.js.map