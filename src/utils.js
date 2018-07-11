import isObject from 'isobject';
import isPlainObject from 'is-plain-object';

export {
  isObject,
  isPlainObject,
};

const hasOwnProperty = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;

export const isArray = actual => toString.call(actual) === '[object Array]';
export const isDate = actual => toString.call(actual) === '[object Date]';

export const has = (object, property) => hasOwnProperty.call(object, property);
export const each = (object, action) => {
  if (isArray(object) && Array.prototype.forEach) {
    object.forEach(action);
  } else if (object && typeof object === 'object') {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in object) {
      if (has(object, key)) {
        action(object[key], key);
      }
    }
  }
};

export const every = (object, predicate) => {
  if (isArray(object) && Array.prototype.every) {
    return object.every(predicate);
  } else if (object && typeof object === 'object') {
    // eslint-disable-next-line no-restricted-syntax
    for (const key in object) {
      if (has(object, key)) {
        if (!predicate(object[key], key)) {
          return false;
        }
      }
    }
  }
  return true;
};

export const isEmpty = (object) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const key in object) {
    if (has(object, key)) {
      return false;
    }
  }
  return true;
};

export const getAny = (object) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const k in object) {
    if (has(object, k)) {
      return object[k];
    }
  }
  return undefined;
};

export const constant = x => () => x;
export const identity = x => x;

export const combine = (validators) => {
  if (!validators || validators.length === 0) {
    return constant();
  }
  return validators.reduce(
    (previous, current) => (
      current ? (actual => previous(actual) || current(actual)) : previous
    ),
    constant(),
  );
};
