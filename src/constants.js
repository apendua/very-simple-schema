export const ERROR_MISSING_FIELD = 'core.missingField';
export const ERROR_KEY_NOT_ALLOWED = 'core.keyNotAllowed';
export const ERROR_INVALID_DATE = 'core.invalidDate';
export const ERROR_DOES_NOT_MATCH = 'core.doesNotMatch';
export const ERROR_NOT_EQUAL = 'core.notEqual';
export const ERROR_NOT_INTEGER = 'core.notInteger';
export const ERROR_NOT_STRING = 'core.notString';
export const ERROR_NOT_NUMBER = 'core.notNumber';
export const ERROR_NOT_BOOLEAN = 'core.notBoolean';
export const ERROR_NOT_ARRAY = 'core.notArray';
export const ERROR_NOT_OBJECT = 'core.notObject';
export const ERROR_NOT_DATE = 'core.notDate';
export const ERROR_NOT_INSTANCE_OF = 'core.notInstanceOf';
export const ERROR_VALUE_NOT_ALLOWED = 'core.valueNotAllowed';
export const ERROR_LENGTH_NOT_EQUAL = 'core.lengthNotEqual';
export const ERROR_TOO_MANY = 'core.tooMany';
export const ERROR_TOO_FEW = 'core.tooFew';
export const ERROR_TOO_LONG = 'core.tooLong';
export const ERROR_TOO_SHORT = 'core.tooShort';
export const ERROR_TOO_LARGE = 'core.tooLarge';
export const ERROR_TOO_SMALL = 'core.tooSmall';
export const ERROR_IS_EMPTY = 'core.isEmpty';

export const MESSAGES = {
  [ERROR_MISSING_FIELD]:       ({ label }) => `${label} is required`,
  [ERROR_KEY_NOT_ALLOWED]:     ({ label }) => `${label} is not allowed`,
  [ERROR_INVALID_DATE]:        ({ label }) => `${label} is not a valid date`,
  [ERROR_DOES_NOT_MATCH]:      ({ label, expected }) => `${label} should ${expected}`,
  [ERROR_NOT_EQUAL]:           ({ label, expected }) => `${label} should equal ${expected}`,
  [ERROR_NOT_INTEGER]:         ({ label }) => `${label} should be an integer`,
  [ERROR_NOT_STRING]:          ({ label }) => `${label} should be a string`,
  [ERROR_NOT_NUMBER]:          ({ label }) => `${label} should be a number`,
  [ERROR_NOT_BOOLEAN]:         ({ label }) => `${label} should be a boolean`,
  [ERROR_NOT_ARRAY]:           ({ label }) => `${label} should be an array`,
  [ERROR_NOT_OBJECT]:          ({ label }) => `${label} should be an object`,
  [ERROR_NOT_INSTANCE_OF]:     ({ label, expected }) => `${label} should be a ${expected}`,
  [ERROR_VALUE_NOT_ALLOWED]:   ({ label, expected }) => `${label} should be one of: ${expected.join(', ')}`,
  [ERROR_TOO_MANY]:            ({ label, expected }) => `${label} should have at most ${expected} elements`,
  [ERROR_TOO_FEW]:             ({ label, expected }) => `${label} should have at least ${expected} elements`,
  [ERROR_TOO_LONG]:            ({ label, expected }) => `${label} should be of length at most ${expected}`,
  [ERROR_TOO_SHORT]:           ({ label, expected }) => `${label} should be of length at least ${expected}`,
  [ERROR_TOO_LARGE]:           ({ label, expected }) => `${label} should be at most ${expected}`,
  [ERROR_TOO_SMALL]:           ({ label, expected }) => `${label} should be at least ${expected}`,
  [ERROR_IS_EMPTY]:            ({ label }) => `${label} should be non empty`,
};
