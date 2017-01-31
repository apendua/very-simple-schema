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
  ERROR_EXPECTED_CONSTRUCTOR,
} from './constants.js';

export const createValidateEquals = expected => value =>
  (value === expected ? undefined : { value, expected, error: ERROR_NOT_EQUAL });
export const createValidateInstanceOf = constructor => value =>
  (value instanceof constructor ? undefined : { value, expected: constructor.name, error: ERROR_EXPECTED_CONSTRUCTOR });

export const isArray = value => Object.prototype.toString.call(value) === '[object Array]';
export const isDate = value => Object.prototype.toString.call(value) === '[object Date]';
export const isObject = value => value && typeof value === 'object';

export const validateIsString = value =>
  (typeof value === 'string' ? undefined : { value, error: ERROR_EXPECTED_STRING });
export const validateIsNumber = value =>
  (typeof value === 'number' ? undefined : { value, error: ERROR_EXPECTED_NUMBER });
export const validateIsBoolean = value =>
  (typeof value === 'boolean' ? undefined : { value, error: ERROR_EXPECTED_BOOLEAN });

export const validateIsValidDate = value =>
  (!isNaN(value.getTime()) ? undefined : { value, error: ERROR_BAD_DATE });
export const validateIsInteger = value =>
  (value % 1 === 0 ? undefined : { value, error: ERROR_NO_DECIMAL });
export const validateIsObject = value =>
  (value && typeof value === 'object' ? undefined : { value, error: ERROR_EXPECTED_OBJECT });
export const validateIsArray = value =>
  (isArray(value) ? undefined : { value, error: ERROR_EXPECTED_ARRAY });
export const validateIsDate = value =>
  (isDate(value) ? undefined : { value, error: ERROR_EXPECTED_DATE });

export const combine = validators => (value) => {
  for (const validate of validators) {
    const error = validate && validate(value);
    if (error) {
      return error;
    }
  }
  return undefined;
};
