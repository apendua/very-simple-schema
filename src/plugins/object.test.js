/* eslint-env jest */
import {
  ERROR_MISSING_FIELD,
  ERROR_NOT_STRING,
  ERROR_NOT_OBJECT,
} from '../constants.js';
import pluginObject from './object.js';
import {
  applyPlugins,
  pluginSchema,
} from '../createCompiler.js';
import pluginAtomic from './atomic';

jest.mock('./atomic'); // use a simplified version of the plugin

describe('Test object plugin', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    const compiler = applyPlugins({
      Schema: class Schema {
        constructor(schemaDef) {
          this.schemaDef = schemaDef;
        }
      },
      options: {},
    }, [
      pluginAtomic,
      pluginObject,
      pluginSchema,
    ]);
    testContext.Schema = compiler.Schema;
    testContext.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, schemaDef, schemaOptions).validate;
  });

  describe('Given an empty object schema', () => {
    beforeEach(() => {
      testContext.validate = testContext.createValidate({});
    });
    test('should accept an empty object', () => {
      expect(testContext.validate({})).toBeFalsy();
    });
    test('should reject an array', () => {
      expect(testContext.validate([])).toEqual({
        actual: [],
        error: ERROR_NOT_OBJECT,
      });
    });
  });

  describe('Given an object schema', () => {
    beforeEach(() => {
      testContext.validate1 = testContext.createValidate({
        a: { type: String },
        b: { type: String, optional: true },
        x: { type: String },
      });
      testContext.validate2 = testContext.createValidate({
        a: String,
        b: String,
        x: String,
      });
      testContext.validate3 = testContext.createValidate({
        a: { type: String },
        b: { type: String, optional: true },
      }, {
        emptyStringsAreMissingValues: true,
      });
    });
    test('should accept a valid object', () => {
      expect(testContext.validate1({
        a: '',
        b: '',
        x: '',
      })).toBeFalsy();
    });
    test('should reject if required fields are missing', () => {
      expect(testContext.validate1({})).toEqual({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          x: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    test('should reject if required fields are null or undefined', () => {
      expect(testContext.validate1({
        a: null,
        x: undefined,
      })).toEqual({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          x: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    test('should reject if required fields are missing (shorthand)', () => {
      expect(testContext.validate2({})).toEqual({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          b: { error: ERROR_MISSING_FIELD },
          x: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    test('should reject if a fields is of invalid type', () => {
      expect(testContext.validate1({
        a: 1,
        x: true,
      })).toEqual({
        errors: {
          a: { error: ERROR_NOT_STRING, actual: 1 },
          x: { error: ERROR_NOT_STRING, actual: true },
        },
      });
    });
    test('should reject if a fields is of invalid type (shorthand)', () => {
      expect(testContext.validate2({
        a: 1,
        b: 2,
        x: true,
      })).toEqual({
        errors: {
          a: { error: ERROR_NOT_STRING, actual: 1 },
          b: { error: ERROR_NOT_STRING, actual: 2 },
          x: { error: ERROR_NOT_STRING, actual: true },
        },
      });
    });
    test(
      'should reject if required string is empty and empty strings are missing values',
      () => {
        expect(testContext.validate3({
          a: '',
          b: '', // this one is optional
        })).toEqual({
          errors: {
            a: { error: ERROR_MISSING_FIELD },
          },
        });
      },
    );
  });

  describe('Given fields are optional by default', () => {
    beforeEach(() => {
      testContext.validate1 = testContext.createValidate({
        a: { type: String },
        b: { type: String },
        c: { type: String },
      }, {
        required: ['a', 'b'],
        fieldsOptionalByDefault: true,
      });
    });
    test('should accept a valid object', () => {
      expect(testContext.validate1({
        a: '',
        b: '',
      })).toBeFalsy();
    });
    test('should reject if required fields are missing', () => {
      expect(testContext.validate1({})).toEqual({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          b: { error: ERROR_MISSING_FIELD },
        },
      });
    });
    test('should reject if required fields are null or undefined', () => {
      expect(testContext.validate1({
        a: null,
        b: undefined,
      })).toEqual({
        errors: {
          a: { error: ERROR_MISSING_FIELD },
          b: { error: ERROR_MISSING_FIELD },
        },
      });
    });
  });

  describe('Given a nested object schema', () => {
    beforeEach(() => {
      testContext.validate1 = testContext.createValidate({
        a: new testContext.Schema({
          x: String,
          y: String,
        }),
        b: {
          type: {
            x: String,
            y: String,
          },
        },
      });
    });
    test('should reject object with missing properties', () => {
      expect(testContext.validate1({
        a: { x: 'a' },
        b: { x: 'a' },
      })).toEqual({
        errors: {
          a: { errors: { y: { error: ERROR_MISSING_FIELD } } },
          b: { errors: { y: { error: ERROR_MISSING_FIELD } } },
        },
      });
    });
  });
});
