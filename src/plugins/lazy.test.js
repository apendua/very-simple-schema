/* eslint-env jest */
import {
  ERROR_NOT_NUMBER,
} from '../constants.js';
import pluginLazy from './lazy.js';
import { applyPlugins } from '../createCompiler.js';
import pluginAtomic from './atomic';

jest.mock('./atomic'); // use a simplified version of the plugin

const compiler = applyPlugins({}, [
  pluginAtomic,
  pluginLazy,
]);

describe('Test lazy plugin', () => {
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

  describe('Given a lazy Number schema', () => {
    beforeEach(() => {
      testContext.validate1 = testContext.createValidate(() => Number, { lazy: true });
    });

    test('should accept a number', () => {
      expect(testContext.validate1(1)).toBeFalsy();
    });

    test('should reject if value is not a number', () => {
      expect(testContext.validate1(true)).toEqual({
        error: ERROR_NOT_NUMBER,
        actual: true,
      });
    });
  });
});
