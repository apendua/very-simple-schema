/* eslint-env jest */
import {
  ERROR_MISSING_FIELD,
  ERROR_NOT_INTEGER,
  ERROR_KEY_NOT_ALLOWED,
} from './constants.js';
import SimpleSchema from './SimpleSchema.js';

describe('Test SimpleSchema', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  describe('Given empty schema', () => {
    beforeEach(() => {
      testContext.schema = new SimpleSchema({});
    });
    test('should not allow additional properties', () => {
      expect(testContext.schema.getErrors({
        a: 1,
      })).toEqual({
        errors: {
          a: {
            error: ERROR_KEY_NOT_ALLOWED,
          },
        },
      });
    });
  });

  describe('Given a number schema', () => {
    beforeEach(() => {
      testContext.schema = new SimpleSchema(Number);
    });
    test('should not non-integers by default', () => {
      expect(testContext.schema.getErrors(0.5)).toEqual({
        error: ERROR_NOT_INTEGER,
        actual: 0.5,
      });
    });
  });

  describe('Given an object schema', () => {
    beforeEach(() => {
      testContext.schema = new SimpleSchema({
        a: { type: String },
      });
    });
    test('should treat empty string as missing value', () => {
      expect(testContext.schema.getErrors({
        a: '',
      })).toEqual({
        errors: {
          a: {
            error: ERROR_MISSING_FIELD,
          },
        },
      });
    });
  });
});
