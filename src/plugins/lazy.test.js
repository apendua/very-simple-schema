/* eslint-env jest */
import {
  ERROR_NOT_NUMBER,
} from '../constants.js';
import pluginLazy from './lazy.js';
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
      return {
        ...validator,
        validate: combine([
          validator.validate,
          validateIsNumber,
        ]),
      };
    }
    return next(validator, schemaDef, schemaOptions);
  },
};
const compiler = applyPlugins({}, [
  pluginNumber,
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
