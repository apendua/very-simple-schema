/* eslint-env jest */
import {
  ERROR_NOT_STRING,
  ERROR_LENGTH_NOT_EQUAL,
} from '../constants';
import pluginTuple from './tuple';
import { applyPlugins } from '../createCompiler';
import pluginAtomic from './atomic';

describe('Test tuple plugin', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    const compiler = applyPlugins({
      Schema: class Schema {},
      options: {},
    }, [
      pluginAtomic,
      pluginTuple,
    ]);
    pluginTuple.mixin(compiler.Schema);
    testContext.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, new compiler.Schema.Tuple(schemaDef), schemaOptions).validate;
  });

  describe('Given a "tuple" schema', () => {
    beforeEach(() => {
      testContext.validate1 = testContext.createValidate([Number, String]);
      testContext.validate2 = testContext.createValidate([Number, Number, Number]);
    });
    test('accepts a tuple of number, string', () => {
      expect(testContext.validate1([1, 'a'])).toBeFalsy();
    });
    test('accepts a tuple of numbers', () => {
      expect(testContext.validate2([1, 2, 3])).toBeFalsy();
    });
    test('rejects if one coordinate is invalid', () => {
      expect(testContext.validate1([1, 1])).toEqual({
        errors: [
          undefined,
          {
            error: ERROR_NOT_STRING,
            actual: 1,
          },
        ],
      });
    });
    test('rejects length is invalid', () => {
      expect(testContext.validate2([1, 1, 1, 1])).toEqual({
        error: ERROR_LENGTH_NOT_EQUAL,
        expected: 3,
        actual: 4,
      });
    });
  });
});
