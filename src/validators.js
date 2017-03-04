/* eslint max-len: "off" */
import {
  ERROR_BAD_DATE,
  ERROR_NOT_EQUAL,
  ERROR_NO_DECIMAL,
  ERROR_EXPECTED_STRING,
  ERROR_EXPECTED_NUMBER,
  ERROR_EXPECTED_BOOLEAN,
  ERROR_EXPECTED_DATE,
  ERROR_EXPECTED_ARRAY,
  ERROR_EXPECTED_OBJECT,
  ERROR_EXPECTED_INSTANCE_OF,
  ERROR_NOT_ALLOWED,
  ERROR_MIN_COUNT,
  ERROR_MAX_COUNT,
  ERROR_MIN,
  ERROR_MAX,
} from './constants.js';

export const createValidateEquals = expected => actual => (actual === expected ? undefined : { actual, expected, error: ERROR_NOT_EQUAL });
export const createValidateInstanceOf = constructor => actual => (actual instanceof constructor ? undefined : { actual, expected: constructor.name, error: ERROR_EXPECTED_INSTANCE_OF });

export const createValidateMinCount = expected => actual => (actual.length >= expected ? undefined : { error: ERROR_MIN_COUNT, expected });
export const createValidateMaxCount = expected => actual => (actual.length <= expected ? undefined : { error: ERROR_MAX_COUNT, expected });

export const createValidateMin = expected => actual => (actual >= expected ? undefined : { error: ERROR_MIN, expected });
export const createValidateMax = expected => actual => (actual <= expected ? undefined : { error: ERROR_MAX, expected });

export const createValidateIsAllowed = allowedValues => actual =>
  (allowedValues.indexOf(actual) >= 0 ? undefined : { actual, expected: allowedValues, error: ERROR_NOT_ALLOWED });

export const isArray = actual => Object.prototype.toString.call(actual) === '[object Array]';
export const isDate = actual => Object.prototype.toString.call(actual) === '[object Date]';
export const isObject = actual => Object.prototype.toString.call(actual) === '[object Object]';

export const validateIsString = actual => (typeof actual === 'string' ? undefined : { actual, error: ERROR_EXPECTED_STRING });
export const validateIsNumber = actual => (typeof actual === 'number' ? undefined : { actual, error: ERROR_EXPECTED_NUMBER });
export const validateIsBoolean = actual => (typeof actual === 'boolean' ? undefined : { actual, error: ERROR_EXPECTED_BOOLEAN });

export const validateIsValidDate = actual => (!isNaN(actual.getTime()) ? undefined : { actual, error: ERROR_BAD_DATE });
export const validateIsInteger = actual => (actual % 1 === 0 ? undefined : { actual, error: ERROR_NO_DECIMAL });
export const validateIsObject = actual => (actual && typeof actual === 'object' ? undefined : { actual, error: ERROR_EXPECTED_OBJECT });
export const validateIsArray = actual => (isArray(actual) ? undefined : { actual, error: ERROR_EXPECTED_ARRAY });
export const validateIsDate = actual => (isDate(actual) ? undefined : { actual, error: ERROR_EXPECTED_DATE });

export const combine = validators => validators.reduce((previous, current) => (current ? (actual => previous(actual) || current(actual)) : previous), () => {});
