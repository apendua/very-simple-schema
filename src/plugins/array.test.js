/* eslint-env jest */
import {
  ERROR_NOT_NUMBER,
  ERROR_NOT_ARRAY,
  ERROR_TOO_FEW,
  ERROR_TOO_MANY,
} from '../constants.js';
import pluginArray from './array.js';
import {
  combine,
} from '../utils.js';
import {
  validateIsNumber,
} from '../validators.js';
import { applyPlugins } from '../createCompiler.js';

const pluginNumber = {
  compile: () => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef === Number) {
      return next({
        ...validator,
        validate: combine([
          validator.validate,
          validateIsNumber,
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
};
const compiler = applyPlugins({}, [
  pluginNumber,
  pluginArray,
]);

describe('Test array plugin', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    testContext.Schema = function () {};
    testContext.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, schemaDef, schemaOptions).validate;
  });

  describe('Given an array schema', () => {
    beforeEach(() => {
      testContext.validate1 = testContext.createValidate([Number]);
      testContext.validate2 = testContext.createValidate([Number], { minCount: 1 });
      testContext.validate3 = testContext.createValidate([Number], { maxCount: 2 });
    });
    test('should return error if not an array', () => {
      expect(testContext.validate1('this is not an array')).toEqual({
        error: ERROR_NOT_ARRAY,
        actual: 'this is not an array',
      });
    });
    test('should accept array of numbers', () => {
      expect(testContext.validate1([1, 2, 3])).toBeFalsy();
    });
    test('should reject array of strings', () => {
      expect(testContext.validate1(['a', 'b'])).toEqual({
        errors: [{
          error: ERROR_NOT_NUMBER,
          actual: 'a',
        }, {
          error: ERROR_NOT_NUMBER,
          actual: 'b',
        }],
      });
    });
    test('should accept array with minimal number of elements', () => {
      expect(testContext.validate2([1])).toBeFalsy();
    });
    test('should reject array with to little elements', () => {
      expect(testContext.validate2([])).toEqual({
        error: ERROR_TOO_FEW,
        actual: [],
        expected: 1,
      });
    });
    test('should accept array with maximal number of elements', () => {
      expect(testContext.validate2([1, 2])).toBeFalsy();
    });
    test('should reject array with to many elements', () => {
      expect(testContext.validate3([1, 2, 3])).toEqual({
        error: ERROR_TOO_MANY,
        actual: [1, 2, 3],
        expected: 2,
      });
    });
  });
});
