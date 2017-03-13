/* eslint max-len: "off" */
import {
  ERROR_MISSING_FIELD,
  ERROR_KEY_NOT_ALLOWED,
  ERROR_INVALID_DATE,
  ERROR_NOT_EQUAL,
  ERROR_NOT_INTEGER,
  ERROR_NOT_STRING,
  ERROR_NOT_NUMBER,
  ERROR_NOT_BOOLEAN,
  ERROR_NOT_DATE,
  ERROR_NOT_ARRAY,
  ERROR_NOT_OBJECT,
  ERROR_NOT_INSTANCE_OF,
  ERROR_VALUE_NOT_ALLOWED,
  ERROR_TOO_FEW,
  ERROR_TOO_MANY,
  ERROR_TOO_LONG,
  ERROR_TOO_SHORT,
  ERROR_TOO_SMALL,
  ERROR_TOO_LARGE,
  ERROR_IS_EMPTY,
} from './constants.js';

const hasOwnProperty = Object.prototype.hasOwnProperty;
const toString = Object.prototype.toString;

export const has = (object, property) => hasOwnProperty.call(object, property);

export const createValidateEquals = expected => actual => (actual === expected ? undefined : { error: ERROR_NOT_EQUAL, actual, expected });
export const createValidateInstanceOf = expected => actual => (actual instanceof expected ? undefined : { error: ERROR_NOT_INSTANCE_OF, actual, expected });

export const createValidateMinLength = expected => actual => (actual.length >= expected ? undefined : { error: ERROR_TOO_SHORT, actual, expected });
export const createValidateMaxLength = expected => actual => (actual.length <= expected ? undefined : { error: ERROR_TOO_LONG, actual, expected });

export const createValidateMinCount = expected => actual => (actual.length >= expected ? undefined : { error: ERROR_TOO_FEW, actual, expected });
export const createValidateMaxCount = expected => actual => (actual.length <= expected ? undefined : { error: ERROR_TOO_MANY, actual, expected });

export const createValidateMin = expected => actual => (actual >= expected ? undefined : { error: ERROR_TOO_SMALL, actual, expected });
export const createValidateMax = expected => actual => (actual <= expected ? undefined : { error: ERROR_TOO_LARGE, actual, expected });

export const createValidateIsAllowed = expected => actual =>
  (expected.indexOf(actual) >= 0 ? undefined : { error: ERROR_VALUE_NOT_ALLOWED, actual, expected });

export const isArray = actual => toString.call(actual) === '[object Array]';
export const isDate = actual => toString.call(actual) === '[object Date]';
export const isObject = actual => toString.call(actual) === '[object Object]';

export const validateIsString = actual => (typeof actual === 'string' ? undefined : { error: ERROR_NOT_STRING, actual });
export const validateIsNumber = actual => (typeof actual === 'number' ? undefined : { error: ERROR_NOT_NUMBER, actual });
export const validateIsBoolean = actual => (typeof actual === 'boolean' ? undefined : { error: ERROR_NOT_BOOLEAN, actual });

export const validateIsValidDate = actual => (!isNaN(actual.getTime()) ? undefined : { error: ERROR_INVALID_DATE, actual });
export const validateIsInteger = actual => (actual % 1 === 0 ? undefined : { error: ERROR_NOT_INTEGER, actual });
export const validateIsObject = actual => (actual && typeof actual === 'object' ? undefined : { error: ERROR_NOT_OBJECT, actual });
export const validateIsArray = actual => (isArray(actual) ? undefined : { error: ERROR_NOT_ARRAY, actual });
export const validateIsDate = actual => (isDate(actual) ? undefined : { error: ERROR_NOT_DATE, actual });
export const validateNonEmpty = actual => (actual.length > 0 ? undefined : { error: ERROR_IS_EMPTY, actual });

export const combine = validators => validators.reduce((previous, current) => (current ? (actual => previous(actual) || current(actual)) : previous), () => {});
export const createValidateProperties = ({
  properties,
  additionalProperties,
  emptyStringsAreMissingValues,
}) => (value) => {
  const errors = {};
  Object.keys(properties).forEach((key) => {
    const property = properties[key];
    const valueAtKey = value[key];
    if (
        valueAtKey === undefined ||
        valueAtKey === null ||
        (emptyStringsAreMissingValues && valueAtKey === '')
    ) {
      if (!property.optional) {
        errors[key] = { error: ERROR_MISSING_FIELD };
      }
    } else {
      const error = property.validate(valueAtKey);
      if (error) {
        errors[key] = error;
      }
    }
  });
  if (!additionalProperties) {
    Object.keys(value).forEach((key) => {
      if (!has(properties, key)) {
        errors[key] = { error: ERROR_KEY_NOT_ALLOWED };
      }
    });
  }
  return Object.keys(errors).length > 0 ? { errors } : undefined;
};
