import isObject from 'isobject';
import isPlainObject from 'is-plain-object';

const hasOwnProperty = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;

const has = (object, property) => hasOwnProperty.call(object, property);
const each = (object, action) => {
  if (object && typeof object === 'object') {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in object) {
      if (has(object, key)) {
        action(object[key], key);
      }
    }
  }
};

const every = (array, predicate) => {
  const n = array.length;
  for (let i = 0; i < n; i += 1) {
    if (!predicate(array[i])) {
      return false;
    }
  }
  return true;
};

const isArray = actual => toString.call(actual) === '[object Array]';
const isDate = actual => toString.call(actual) === '[object Date]';

export const isEmpty = (object) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in object) {
    if (has(object, key)) {
      return false;
    }
  }
  return true;
};

const noop = () => {};

export const combine = (validators) => {
  if (!validators || validators.length === 0) {
    return noop;
  }
  return validators.reduce(
    (previous, current) => (
      current ? (actual => previous(actual) || current(actual)) : previous
    ),
    noop,
  );
};

export {
  isDate,
  each,
  every,
  has,
  isArray,
  isObject,
  isPlainObject,
};
