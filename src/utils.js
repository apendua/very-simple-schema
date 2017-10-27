import isObject from 'isobject';
import isPlainObject from 'is-plain-object';

const hasOwnProperty = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;

export const has = (object, property) => hasOwnProperty.call(object, property);
export const each = (object, action) => {
  if (object && typeof object === 'object') {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in object) {
      if (has(object, key)) {
        action(object[key], key);
      }
    }
  }
};

export const isArray = actual => Array.isArray(actual);
export const isDate = actual => toString.call(actual) === '[object Date]';

const noop = () => {};
export const combine = validators => validators.reduce(
  (previous, current) => (
    current ? (actual => previous(actual) || current(actual)) : previous
  ),
  noop,
);

export {
  isObject,
  isPlainObject,
};
