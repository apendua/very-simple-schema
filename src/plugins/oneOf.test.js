/* eslint-env jest */
import {
  ERROR_NO_ALTERNATIVE,
} from '../constants';
import pluginOneOf from './oneOf';
import pluginAtomic from './atomic';
import { applyPlugins } from '../createCompiler';

jest.mock('./atomic'); // use a simplified version of the plugin

describe('Test oneOf plugin', () => {
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
      pluginOneOf,
    ]);
    pluginOneOf.mixin(compiler.Schema);
    testContext.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, new compiler.Schema.OneOf(schemaDef), schemaOptions).validate;
  });

  describe('Given a "oneOf" schema', () => {
    beforeEach(() => {
      testContext.validate1 = testContext.createValidate([Number, String]);
    });
    test('should accept a number', () => {
      expect(testContext.validate1(1)).toBeFalsy();
    });
    test('should accept a string', () => {
      expect(testContext.validate1('a')).toBeFalsy();
    });
    test('should reject if neither string nor number', () => {
      expect(testContext.validate1(true)).toEqual({
        error: ERROR_NO_ALTERNATIVE,
        expected: ['number', 'string'],
      });
    });
  });
});
