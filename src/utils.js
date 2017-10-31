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

const isArray = actual => Array.isArray(actual);
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
export const annotateError = (validate, label) => {
  if (!validate) {
    return noop;
  }
  if (!label) {
    return validate;
  }
  return (value) => {
    const error = validate(value);
    if (error) {
      return {
        label,
        ...error,
      };
    }
    return error;
  };
};

export const combine = (validators, { label } = {}) => {
  if (!validators || validators.length === 0) {
    return noop;
  }
  const validate = validators.reduce(
    (previous, current) => (
      current ? (actual => previous(actual) || current(actual)) : previous
    ),
    noop,
  );
  return annotateError(validate, label);
};

export {
  isDate,
  each,
  has,
  isArray,
  isObject,
  isPlainObject,
};
