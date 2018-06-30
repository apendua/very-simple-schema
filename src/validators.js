/* eslint max-len: "off" */
import {
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
  ERROR_TOO_FEW,
  ERROR_TOO_MANY,
  ERROR_TOO_LONG,
  ERROR_TOO_SHORT,
  ERROR_TOO_SMALL,
  ERROR_TOO_LARGE,
  ERROR_IS_EMPTY,
} from './constants.js';
import {
  isArray,
  isPlainObject,
  isDate,
} from './utils.js';

export const validateAlways = () => {};

export const createValidateEquals = expected => actual => (actual === expected ? undefined : { error: ERROR_NOT_EQUAL, actual, expected });
export const createValidateInstanceOf = expected => actual => (actual instanceof expected ? undefined : { error: ERROR_NOT_INSTANCE_OF, actual, expected });

export const createValidateMinLength = expected => actual => (actual.length >= expected ? undefined : { error: ERROR_TOO_SHORT, actual, expected });
export const createValidateMaxLength = expected => actual => (actual.length <= expected ? undefined : { error: ERROR_TOO_LONG, actual, expected });

export const createValidateMinCount = expected => actual => (actual.length >= expected ? undefined : { error: ERROR_TOO_FEW, actual, expected });
export const createValidateMaxCount = expected => actual => (actual.length <= expected ? undefined : { error: ERROR_TOO_MANY, actual, expected });

export const createValidateMin = expected => actual => (actual >= expected ? undefined : { error: ERROR_TOO_SMALL, actual, expected });
export const createValidateMax = expected => actual => (actual <= expected ? undefined : { error: ERROR_TOO_LARGE, actual, expected });

export const validateIsString = actual => (typeof actual === 'string' ? undefined : { error: ERROR_NOT_STRING, actual });
export const validateIsNumber = actual => (typeof actual === 'number' ? undefined : { error: ERROR_NOT_NUMBER, actual });
export const validateIsBoolean = actual => (typeof actual === 'boolean' ? undefined : { error: ERROR_NOT_BOOLEAN, actual });

export const validateIsValidDate = actual => (!isNaN(actual.getTime()) ? undefined : { error: ERROR_INVALID_DATE, actual });
export const validateIsInteger = actual => (actual % 1 === 0 ? undefined : { error: ERROR_NOT_INTEGER, actual });
export const validateIsObject = actual => (isPlainObject(actual) ? undefined : { error: ERROR_NOT_OBJECT, actual });
export const validateIsArray = actual => (isArray(actual) ? undefined : { error: ERROR_NOT_ARRAY, actual });
export const validateIsDate = actual => (isDate(actual) ? undefined : { error: ERROR_NOT_DATE, actual });
export const validateNonEmpty = actual => (actual.length > 0 ? undefined : { error: ERROR_IS_EMPTY, actual });
