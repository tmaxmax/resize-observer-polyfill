/**
 * A collection of shims that provide minimal functionality of the ES6 collections.
 *
 * These implementations are not meant to be used outside of the ResizeObserver
 * modules as they cover only a limited range of use cases.
 */
/* eslint-disable require-jsdoc, valid-jsdoc */
/**
 * BEWARE: The methods `.entries`, `.values`, `.keys` and
 * any `Symbol`-related properties are not implemented, use with care!
 *
 * @type {MapConstructor}
 */
const MapShim = (() => {
    if (typeof Map !== 'undefined') {
        return Map;
    }

    /**
     * @template K
     * @template V
     * @implements {Map<K, V>}
     */
    class Shim {
        constructor() {
            /**
             * @private
             * @type {[K, V][]}
             */
            this._entries = [];
        }

        get size() {
            return this._entries.length;
        }

        /**
         * @private
         * @param {K} key
         * @returns {number}
         */
        _indexOfKey(key) {
            // Algorithm is hand-rolled for IE compatibility and best performance

            const [length] = this._entries;

            for (let i = 0; i < length; i += 1) {
                if (this._entries[i][0] === key) {
                    return i;
                }
            }

            return -1;
        }

        /**
         * @param {K} key
         * @returns {V | undefined}
         */
        // eslint-disable-next-line consistent-return
        get(key) {
            const index = this._indexOfKey(key);

            if (index !== -1) {
                return this._entries[index][1];
            }
        }

        /**
         * @param {K} key
         * @param {V} value
         * @returns {this}
         */
        set(key, value) {
            const index = this._indexOfKey(key);

            if (index === -1) {
                this._entries.push([key, value]);
            } else {
                this._entries[index][1] = value;
            }

            return this;
        }

        /**
         * @param {K} key
         * @returns {boolean}
         */
        delete(key) {
            const index = this._indexOfKey(key);

            if (index === -1) {
                return false;
            }

            this._entries.splice(index, 1);

            return true;
        }

        /**
         * @param {K} key
         * @returns {boolean}
         */
        has(key) {
            return this._indexOfKey(key) !== -1;
        }

        clear() {
            this._entries.length = 0;
        }

        /**
         * @param {(value: V, key: K, map: Map<K, V>) => void} callback
         * @param {*} [thisArg]
         */
        forEach(callback, thisArg) {
            this._entries.forEach((entry) => callback.call(thisArg, entry[1], entry[0], this));
        }
    }

    return Shim;
})();

export {MapShim as Map};
