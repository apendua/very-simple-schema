/* eslint-env jest */
import {
  ERROR_NOT_NUMBER,
  ERROR_NOT_ARRAY,
  ERROR_TOO_SHORT,
  ERROR_TOO_LONG,
} from '../constants.js';
import pluginArray from './array.js';
import { applyPlugins } from '../createCompiler.js';
import pluginAtomic from './atomic';

jest.mock('./atomic'); // use a simplified version of the plugin

const compiler = applyPlugins({}, [
  pluginAtomic,
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
        error: ERROR_TOO_SHORT,
        actual: [],
        expected: 1,
      });
    });
    test('should accept array with maximal number of elements', () => {
      expect(testContext.validate2([1, 2])).toBeFalsy();
    });
    test('should reject array with to many elements', () => {
      expect(testContext.validate3([1, 2, 3])).toEqual({
        error: ERROR_TOO_LONG,
        actual: [1, 2, 3],
        expected: 2,
      });
    });
  });
});
