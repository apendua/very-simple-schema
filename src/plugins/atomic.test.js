/* eslint-env jest */
import pluginAtomic from './atomic.js';
import {
  ERROR_TOO_SMALL,
  ERROR_TOO_LARGE,
  ERROR_NOT_EQUAL,
  ERROR_TOO_SHORT,
  ERROR_TOO_LONG,
  ERROR_NOT_INTEGER,
  ERROR_NOT_STRING,
  ERROR_NOT_NUMBER,
  ERROR_NOT_BOOLEAN,
  ERROR_NOT_DATE,
  ERROR_INVALID_DATE,
  ERROR_NOT_INSTANCE_OF,
  ERROR_IS_EMPTY,
} from '../constants.js';
import { applyPlugins } from '../createCompiler.js';

const compiler = applyPlugins({
  options: {},
}, [
  pluginAtomic,
]);

class Model {}

describe('Test atomic plugin', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    testContext.Schema = function () {};
    testContext.compile = (schemaDef, schemaOptions = {}) => compiler.compile({}, schemaDef, schemaOptions);
  });

  describe('Given the definition is not atomic', () => {
    beforeEach(() => {
      testContext.schema = testContext.compile([]);
    });
    test('should recognize it is not atomic', () => {
      expect(testContext.schema.isAtomic).toBe(false);
    });
  });

  describe('Given a literal schema', () => {
    describe('and the definition is "1"', () => {
      beforeEach(() => {
        testContext.schema1 = testContext.compile(1);
      });
      test('should recognize this is an atomic schema', () => {
        expect(testContext.schema1.isAtomic).toBe(true);
      });
      test('should recognize this is a literal', () => {
        expect(testContext.schema1.isLiteral).toBe(true);
      });
      test('should accept the right value', () => {
        expect(testContext.schema1.validate(1)).toBeFalsy();
      });
      test('should return error if number is not equal', () => {
        expect(testContext.schema1.validate(2)).toEqual({
          error: ERROR_NOT_EQUAL,
          actual: 2,
          expected: 1,
        });
      });
    });

    describe('and the definition is "a"', () => {
      beforeEach(() => {
        testContext.schema2 = testContext.compile('a');
      });
      test('should recognize this is an atomic schema', () => {
        expect(testContext.schema2.isAtomic).toBe(true);
      });
      test('should recognize this is a literal', () => {
        expect(testContext.schema2.isLiteral).toBe(true);
      });
      test('should accept the right value', () => {
        expect(testContext.schema2.validate('a')).toBeFalsy();
      });
      test('should return error if strings are not equal', () => {
        expect(testContext.schema2.validate('b')).toEqual({
          error: ERROR_NOT_EQUAL,
          actual: 'b',
          expected: 'a',
        });
      });
    });

    describe('and the definition is "true"', () => {
      beforeEach(() => {
        testContext.schema3 = testContext.compile(true);
      });
      test('should recognize this is an atomic schema', () => {
        expect(testContext.schema3.isAtomic).toBe(true);
      });
      test('should recognize this is a literal', () => {
        expect(testContext.schema3.isLiteral).toBe(true);
      });
      test('should validate a boolean', () => {
        expect(testContext.schema3.validate(true)).toBeFalsy();
      });
      test('should return error if booleans are not equal', () => {
        expect(testContext.schema3.validate(false)).toEqual({
          error: ERROR_NOT_EQUAL,
          actual: false,
          expected: true,
        });
      });
    });

    describe('and the definition is "null"', () => {
      beforeEach(() => {
        testContext.schema4 = testContext.compile(null);
      });
      test('should recognize this is an atomic schema', () => {
        expect(testContext.schema4.isAtomic).toBe(true);
      });
      test('should recognize this is a literal', () => {
        expect(testContext.schema4.isLiteral).toBe(true);
      });
      test('should validate a null', () => {
        expect(testContext.schema4.validate(null)).toBeFalsy();
      });
      test('should return error if values is not null', () => {
        expect(testContext.schema4.validate('whatever')).toEqual({
          error: ERROR_NOT_EQUAL,
          actual: 'whatever',
          expected: null,
        });
      });
    });
  });

  describe('Given an atomic schema', () => {
    describe('and the definition is "Number"', () => {
      beforeEach(() => {
        testContext.schema1 = testContext.compile(Number);
        testContext.schema1x = testContext.compile(Number, { decimal: true });
      });
      test('should recognize this is an atomic schema', () => {
        expect(testContext.schema1.isAtomic).toBe(true);
      });
      test('should recognize a Number is expected', () => {
        expect(testContext.schema1.isNumber).toBe(true);
      });
      test('should validate a number', () => {
        expect(testContext.schema1.validate(1)).toBeFalsy();
      });
      test('should reject non integer by default', () => {
        expect(testContext.schema1.validate(0.1)).toEqual({
          error: ERROR_NOT_INTEGER,
          actual: 0.1,
        });
      });
      test('should allow non integer if decimal option is used', () => {
        expect(testContext.schema1x.validate(0.1)).toBeFalsy();
      });
      test('should return error if not a number', () => {
        expect(testContext.schema1.validate('not a number')).toEqual({
          error: ERROR_NOT_NUMBER,
          actual: 'not a number',
        });
      });
    });

    describe('and the definition is "String"', () => {
      beforeEach(() => {
        testContext.schema2 = testContext.compile(String);
        testContext.schema2x = testContext.compile(String, { nonEmpty: true });
      });
      test('should recognize this is an atomic schema', () => {
        expect(testContext.schema2.isAtomic).toBe(true);
      });
      test('should recognize a String is expected', () => {
        expect(testContext.schema2.isString).toBe(true);
      });
      test('should validate a string', () => {
        expect(testContext.schema2.validate('this is a string')).toBeFalsy();
      });
      test('should return error if not a string', () => {
        expect(testContext.schema2.validate(true)).toEqual({
          error: ERROR_NOT_STRING,
          actual: true,
        });
      });
      test('should reject an empty a string', () => {
        expect(testContext.schema2x.validate('')).toEqual({
          error: ERROR_IS_EMPTY,
          actual: '',
        });
      });
    });

    describe('and the definition is "Boolean"', () => {
      beforeEach(() => {
        testContext.schema3 = testContext.compile(Boolean);
      });
      test('should recognize this is an atomic schema', () => {
        expect(testContext.schema3.isAtomic).toBe(true);
      });
      test('should recognize a Boolean is expected', () => {
        expect(testContext.schema3.isBoolean).toBe(true);
      });
      test('should validate a boolean', () => {
        expect(testContext.schema3.validate(true)).toBeFalsy();
      });
      test('should return error if not a boolean', () => {
        expect(testContext.schema3.validate('not a boolean')).toEqual({
          error: ERROR_NOT_BOOLEAN,
          actual: 'not a boolean',
        });
      });
    });

    describe('and the definition is "Number" with min/max', () => {
      beforeEach(() => {
        testContext.schema4 = testContext.compile(Number, { min: 0, max: 10 });
      });
      test('should accept a number value within range', () => {
        expect(testContext.schema4.validate(5)).toBeFalsy();
      });
      test('should reject a number above max', () => {
        expect(testContext.schema4.validate(11)).toEqual({
          error: ERROR_TOO_LARGE,
          actual: 11,
          expected: 10,
        });
      });
      test('should reject a number below min', () => {
        expect(testContext.schema4.validate(-1)).toEqual({
          error: ERROR_TOO_SMALL,
          actual: -1,
          expected: 0,
        });
      });
    });

    describe('and the definition is "String" with min/max', () => {
      beforeEach(() => {
        testContext.schema5 = testContext.compile(String, { min: 2, max: 4 });
      });
      test('should accept a string value within range', () => {
        expect(testContext.schema5.validate('12')).toBeFalsy();
      });
      test('should reject a string above max', () => {
        expect(testContext.schema5.validate('12345')).toEqual({
          error: ERROR_TOO_LONG,
          actual: '12345',
          expected: 4,
        });
      });
      test('should reject a string below min', () => {
        expect(testContext.schema5.validate('1')).toEqual({
          error: ERROR_TOO_SHORT,
          actual: '1',
          expected: 2,
        });
      });
    });

    describe('and the definition is "Date"', () => {
      beforeEach(() => {
        testContext.schema6 = testContext.compile(Date);
        testContext.schema6x = testContext.compile(Date, { min: new Date('2017-01-01'), max: new Date('2017-12-31') });
      });
      test('should accept a Date', () => {
        expect(testContext.schema6.validate(new Date())).toBeFalsy();
      });
      test('should not accept a differt type of data', () => {
        expect(testContext.schema6.validate(1)).toEqual({
          error: ERROR_NOT_DATE,
          actual: 1,
        });
      });
      test('should reject an invalid date', () => {
        const date = new Date('2017-30-30');
        expect(testContext.schema6.validate(date)).toEqual({
          error: ERROR_INVALID_DATE,
          actual: date,
        });
      });
      test('should accept a date within range', () => {
        expect(testContext.schema6x.validate(new Date('2017-03-11'))).toBeFalsy();
      });
      test('should reject a date above max', () => {
        expect(testContext.schema6x.validate(new Date('2018-01-01'))).toEqual({
          error: ERROR_TOO_LARGE,
          actual: new Date('2018-01-01'),
          expected: new Date('2017-12-31'),
        });
      });
      test('should reject a date below min', () => {
        expect(testContext.schema6x.validate(new Date('2016-12-31'))).toEqual({
          error: ERROR_TOO_SMALL,
          actual: new Date('2016-12-31'),
          expected: new Date('2017-01-01'),
        });
      });
    });

    describe('and the definition is custom "Model"', () => {
      beforeEach(() => {
        testContext.schema7 = testContext.compile(Model);
      });
      test('should accept an instance of Model', () => {
        expect(testContext.schema7.validate(new Model())).toBeFalsy();
      });
      test('should not accept a differt type of data', () => {
        expect(testContext.schema7.validate({})).toEqual({
          error: ERROR_NOT_INSTANCE_OF,
          actual: {},
          expected: Model,
        });
      });
    });
  });
});

