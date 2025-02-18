import global from '../shims/global.js';

// eslint-disable-next-line valid-jsdoc
/**
 * Returns the global object associated with provided element.
 *
 * @param {Node} target
 * @returns {Window & typeof globalThis}
 */
export default (target) => {
    // Assume that the element is an instance of Node, which means that it
    // has the "ownerDocument" property from which we can retrieve a
    // corresponding global object.
    const ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;

    // Return the local global object if it's not possible extract one from
    // provided element.
    return ownerGlobal || global;
};
