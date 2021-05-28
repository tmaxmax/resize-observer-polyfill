import {assertType} from '../utils/assert';

/**
 * A collection of shims that provide minimal functionality of the ES6 collections.
 *
 * These implementations are not meant to be used outside of the ResizeObserver
 * modules as they cover only a limited range of use cases.
 */
/* eslint-disable require-jsdoc, valid-jsdoc, no-extra-parens */
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

    const tagPrefix = '__ResizeObserverPolyfill_Map__';
    const generateTag = () =>
        tagPrefix +
        'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;

            return v.toString(16);
        });

    /**
     * @template K
     * @template V
     * @implements {Map<K, V>}
     *
     * A Map shim that has constant lookup time. To achieve this,
     * it uses as keys for the underlying storage object:
     * - the key's `toString()` value, if the key's a primitive
     * - a unique 'tag', if the key's an object.
     *
     * To differentiate objects from one another, a 'tag' is generated
     * for each new object key, which is added to the given object as a
     * new key.
     *
     * Unicity is ensured as following:
     * - on creation, an UUID (a base tag) is assigned to the map, along with an ID counter.
     *   The ID counter is incremented on each insertion (calls to `set`), but it is not
     *   decremented on deletions.
     * - on insertion, a new tag is generated by concatenating the base tag and the current ID.
     * - on clearing, a new base tag is generated and the ID counter is reset.
     *   The previous objects aren't cleared of their tags, as that would
     *   incur a big performance penalty on the `clear` operation, and
     *   given that the tags that will be generated after clearing will
     *   be different anyways.
     *
     * Keep in mind that on deletion the tags are removed from the key objects, though.
     *
     * The insertion process works as following:
     * - the current ID is added to the key object by using the base tag as the value's key.
     * - a tuple with the actual key and the value is added to the map storage object,
     *   using the generated tag (base tag + current ID) as the key.
     *
     * Given that the implementation must add new keys to the key objects,
     * it is required for the keys to be extensible, else MapShim will throw
     * a TypeError on insertion. This implementation will also have a
     * performance overhead when using `number`s or `bigint`s as keys, as
     * they must be converted to `string` in order to be usable as keys for
     * object literals.
     */
    class Shim {
        /**
         * @private
         * @type {Object<string, [K, V]>}
         */
        entries_;

        /**
         * The map's base tag.
         *
         * @private
         * @type {string}
         */
        tag_;

        /**
         * @private
         * @type {number}
         */
        size_;

        /**
         * The ID counter.
         *
         * @private
         * @type {number}
         */
        id_;

        constructor() {
            // The clearing and initialization code is the same
            this.clear();
        }

        get size() {
            return this.size_;
        }

        /**
         * @param {K} key
         * @param {V} value
         * @returns {void}
         */
        insert_(key, value) {
            let tag = key.toString();

            if (typeof key === 'object') {
                assertType(Object.isExtensible(key), 'Cannot use inextensible object as keys with MapShim!');

                const id = this.id_ | 0;

                tag = this.tag_ + id.toString();

                Object.defineProperty(key, this.tag_, {
                    configurable: true,
                    writable: false,
                    enumerable: false,
                    value: id
                });
            } else {
                assertType(
                    !tag.startsWith(tagPrefix),
                    // eslint-disable-next-line quotes
                    "Cannot use primitive that stringifies to a value prefixed by MapShim's tag prefix!"
                );
            }

            this.entries_[tag] = [key, value];
            this.size_ += 1;
            this.id_ += 1;
        }

        /**
         * @param {K} key
         * @returns {string | undefined}
         */
        getTag_(key) {
            let tag;

            if (typeof key === 'object') {
                if (Object.isExtensible(key) && this.tag_ in key) {
                    tag = this.tag_ + key[this.tag_];
                }
            } else {
                tag = key.toString();
            }

            return tag;
        }

        /**
         * @param {string | undefined} tag
         * @returns {boolean}
         */
        exists_(tag) {
            return tag && tag in this.entries_;
        }

        /**
         * @param {K} key
         * @returns {V | undefined}
         */
        // eslint-disable-next-line consistent-return
        get(key) {
            const tag = this.getTag_(key);

            if (this.exists_(tag)) {
                return this.entries_[tag][1];
            }
        }

        /**
         * @param {K} key
         * @param {V} value
         * @returns {this}
         */
        set(key, value) {
            const tag = this.getTag_(key);

            if (this.exists_(tag)) {
                this.entries_[tag][1] = value;
            } else {
                this.insert_(key, value);
            }

            return this;
        }

        /**
         * @param {K} key
         * @returns {boolean}
         */
        delete(key) {
            const tag = this.getTag_(key);

            if (!this.exists_(tag)) {
                return false;
            }

            delete this.entries_[tag];
            delete key[this.tag_];
            this.size_ -= 1;

            return true;
        }

        /**
         * @param {K} key
         * @returns {boolean}
         */
        has(key) {
            return this.exists_(this.getTag_(key));
        }

        clear() {
            this.entries_ = Object.create(null);
            this.size_ = 0;
            this.id_ = 0;
            this.tag_ = generateTag();
        }

        /**
         * @param {(value: V, key: K, map: Map<K, V>) => void} callback
         * @param {*} [thisArg]
         */
        forEach(callback, thisArg) {
            // Object is created with no prototype
            // eslint-disable-next-line guard-for-in
            for (const tag in this.entries_) {
                const entry = this.entries_[tag];

                callback.call(thisArg, entry[1], entry[0], this);
            }
        }
    }

    return Shim;
})();

export {MapShim as Map};
