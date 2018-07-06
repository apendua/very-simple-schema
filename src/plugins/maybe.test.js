/* eslint-env jest */
import {
  ERROR_NOT_NUMBER,
} from '../constants';
import pluginMaybe from './maybe';
import { applyPlugins } from '../createCompiler';
import pluginAtomic from './atomic';

describe('Test maybe plugin', () => {
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
      pluginMaybe,
    ]);
    pluginMaybe.mixin(compiler.Schema);
    testContext.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, new compiler.Schema.Maybe(schemaDef), schemaOptions).validate;
    testContext.createValidate2 =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, schemaDef, {
          ...schemaOptions,
          maybe: true,
        }).validate;
  });

  describe('Given a "maybe" schema', () => {
    beforeEach(() => {
      testContext.validate = testContext.createValidate(Number);
    });
    test('accepts a number', () => {
      expect(testContext.validate(1)).toBeFalsy();
    });
    test('accepts null', () => {
      expect(testContext.validate(null)).toBeFalsy();
    });
    test('accepts undefined', () => {
      expect(testContext.validate(undefined)).toBeFalsy();
    });
    test('rejects a different type', () => {
      expect(testContext.validate('a')).toEqual({
        error: ERROR_NOT_NUMBER,
        actual: 'a',
      });
    });
  });

  describe('Given a "maybe" schema defined with maybe property', () => {
    beforeEach(() => {
      testContext.validate = testContext.createValidate2(Number);
    });
    test('accepts a number', () => {
      expect(testContext.validate(1)).toBeFalsy();
    });
    test('accepts null', () => {
      expect(testContext.validate(null)).toBeFalsy();
    });
    test('accepts undefined', () => {
      expect(testContext.validate(undefined)).toBeFalsy();
    });
    test('rejects a different type', () => {
      expect(testContext.validate('a')).toEqual({
        error: ERROR_NOT_NUMBER,
        actual: 'a',
      });
    });
  });
});
