import isObject from 'isobject';
import isPlainObject from 'is-plain-object';

const hasOwnProperty = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;

export const has = (object, property) => hasOwnProperty.call(object, property);

export const isArray = actual => Array.isArray(actual);
export const isDate = actual => toString.call(actual) === '[object Date]';

export {
  isObject,
  isPlainObject,
};
