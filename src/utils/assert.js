/**
 * Asserts the given condition. If truthy, does nothing, else throws the given error.
 *
 * @param {*} condition The condition to assert
 * @param {string} errorMessage The message of the thrown error, if the condition is not met.
 * @param {ErrorConstructor} [errorConstructor=Error] The constructor of the thrown error.
 * @returns {void}
 */
export const assert = (condition, errorMessage, errorConstructor = Error) => {
    if (!condition) {
        // eslint-disable-next-line new-cap
        throw new errorConstructor(errorMessage);
    }
};

/**
 * Same as {@link assert}, but uses `TypeError` as the error constructor.
 *
 * @param {*} condition
 * @param {string} errorMessage
 * @returns {void}
 */
export const assertType = (condition, errorMessage) => assert(condition, errorMessage, TypeError);
