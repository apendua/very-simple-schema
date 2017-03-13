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
} from './constants.js';

const objectPrototypeHas = Object.prototype.hasOwnProperty;
export const has = (object, property) => objectPrototypeHas.call(object, property);

export const createValidateEquals = expected => actual => (actual === expected ? undefined : { actual, expected, error: ERROR_NOT_EQUAL });
export const createValidateInstanceOf = constructor => actual => (actual instanceof constructor ? undefined : { actual, expected: constructor.name, error: ERROR_NOT_INSTANCE_OF });

export const createValidateMinLength = expected => actual => (actual.length >= expected ? undefined : { error: ERROR_TOO_SHORT, expected });
export const createValidateMaxLength = expected => actual => (actual.length <= expected ? undefined : { error: ERROR_TOO_LONG, expected });

export const createValidateMinCount = expected => actual => (actual.length >= expected ? undefined : { error: ERROR_TOO_FEW, expected });
export const createValidateMaxCount = expected => actual => (actual.length <= expected ? undefined : { error: ERROR_TOO_MANY, expected });

export const createValidateMin = expected => actual => (actual >= expected ? undefined : { error: ERROR_TOO_SMALL, expected });
export const createValidateMax = expected => actual => (actual <= expected ? undefined : { error: ERROR_TOO_LARGE, expected });

export const createValidateIsAllowed = allowedValues => actual =>
  (allowedValues.indexOf(actual) >= 0 ? undefined : { actual, expected: allowedValues, error: ERROR_VALUE_NOT_ALLOWED });

export const isArray = actual => Object.prototype.toString.call(actual) === '[object Array]';
export const isDate = actual => Object.prototype.toString.call(actual) === '[object Date]';
export const isObject = actual => Object.prototype.toString.call(actual) === '[object Object]';

export const validateIsString = actual => (typeof actual === 'string' ? undefined : { actual, error: ERROR_NOT_STRING });
export const validateIsNumber = actual => (typeof actual === 'number' ? undefined : { actual, error: ERROR_NOT_NUMBER });
export const validateIsBoolean = actual => (typeof actual === 'boolean' ? undefined : { actual, error: ERROR_NOT_BOOLEAN });

export const validateIsValidDate = actual => (!isNaN(actual.getTime()) ? undefined : { actual, error: ERROR_INVALID_DATE });
export const validateIsInteger = actual => (actual % 1 === 0 ? undefined : { actual, error: ERROR_NOT_INTEGER });
export const validateIsObject = actual => (actual && typeof actual === 'object' ? undefined : { actual, error: ERROR_NOT_OBJECT });
export const validateIsArray = actual => (isArray(actual) ? undefined : { actual, error: ERROR_NOT_ARRAY });
export const validateIsDate = actual => (isDate(actual) ? undefined : { actual, error: ERROR_NOT_DATE });

export const combine = validators => validators.reduce((previous, current) => (current ? (actual => previous(actual) || current(actual)) : previous), () => {});
export const createValidateProperties = (properties, additionalProperties) => (value) => {
  const errors = {};
  Object.keys(properties).forEach((key) => {
    const property = properties[key];
    if (!has(value, key)) {
      if (!property.optional) {
        errors[key] = { error: ERROR_MISSING_FIELD };
      }
    } else {
      const error = property.validate(value[key]);
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
