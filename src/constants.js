export const MODE_ARRAY = 'array';
export const MODE_ONE_OF = 'oneOf';
export const MODE_MERGE = 'merge';

export const ERROR_REQUIRED = 'required';
export const ERROR_BAD_DATE = 'badDate';
export const ERROR_NOT_EQUAL = 'notEqual';
export const ERROR_NO_DECIMAL = 'noDecimal';
export const ERROR_EXPECTED_STRING = 'expectedString';
export const ERROR_EXPECTED_NUMBER = 'expectedNumber';
export const ERROR_EXPECTED_BOOLEAN = 'expectedBoolean';
export const ERROR_EXPECTED_ARRAY = 'expectedArray';
export const ERROR_EXPECTED_OBJECT = 'expectedObject';
export const ERROR_EXPECTED_DATE = 'expectedDate';
export const ERROR_EXPECTED_CONSTRUCTOR = 'expectedContructor';
export const ERROR_KEY_NOT_IN_SCHEMA = 'keyNotInSchema';
export const ERROR_NO_MATCH = 'noMatch';

export const MESSAGES = {
  [ERROR_REQUIRED]:             ({ label }) => `${label} is required`,
  [ERROR_BAD_DATE]:             ({ label }) => `${label} is not a valid date`,
  [ERROR_NOT_EQUAL]:            ({ label, value }) => `Expected ${label} to equal ${value}`,
  [ERROR_NO_DECIMAL]:           ({ label }) => `${label} must be an integer`,
  [ERROR_EXPECTED_STRING]:      ({ label }) => `${label} must be a string`,
  [ERROR_EXPECTED_NUMBER]:      ({ label }) => `${label} must be a number`,
  [ERROR_EXPECTED_BOOLEAN]:     ({ label }) => `${label} must be a boolean`,
  [ERROR_EXPECTED_ARRAY]:       ({ label }) => `${label} must be an array`,
  [ERROR_EXPECTED_OBJECT]:      ({ label }) => `${label} must be an object`,
  [ERROR_EXPECTED_CONSTRUCTOR]: ({ label, type }) => `${label} must be a ${type}`,
  [ERROR_KEY_NOT_IN_SCHEMA]:    ({ key }) => `${key} not allowed by the schema`,
  [ERROR_NO_MATCH]:             ({ label }) => `value at ${label} is none of the expected types`,
};
