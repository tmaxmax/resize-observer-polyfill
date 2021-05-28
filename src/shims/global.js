// Given that it's a polyfill there are too many warnings to ignore one by one.
// Polyfill from https://github.com/medikoo/es5-ext/blob/master/global.js.
/* eslint-disable */

var naiveFallback = function () {
    if (typeof self === 'object' && self) return self;
    if (typeof window === 'object' && window) return window;
    throw new Error('Unable to resolve global `this`');
};

export default (function () {
    if (this) return this;

    // Unexpected strict mode (may happen if e.g. bundled into ESM module)

    // Fallback to standard globalThis if available
    if (typeof globalThis === 'object' && globalThis) return globalThis;

    // Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
    // In all ES5+ engines global object inherits from Object.prototype
    // (if you approached one that doesn't please report)
    try {
        Object.defineProperty(Object.prototype, '__global__', {
            get: function () {
                return this;
            },
            configurable: true,
        });
    } catch (error) {
        // Unfortunate case of updates to Object.prototype being restricted
        // via preventExtensions, seal or freeze
        return naiveFallback();
    }
    try {
        // Safari case (window.__global__ works, but __global__ does not)
        if (!__global__) return naiveFallback();
        return __global__;
    } finally {
        delete Object.prototype.__global__;
    }
})();
