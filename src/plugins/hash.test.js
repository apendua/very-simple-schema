/* eslint-env jest */
import {
  ERROR_NOT_STRING,
  ERROR_NOT_OBJECT,
} from '../constants.js';
import pluginHash from './hash.js';
import {
  validateIsString,
} from '../validators.js';
import {
  combine,
} from '../utils.js';
import { applyPlugins } from '../createCompiler.js';

const pluginString = {
  compile: () => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef === String) {
      return next({
        ...validator,
        validate: combine([
          validator.validate,
          validateIsString,
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

describe('Test hash plugin', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    const compiler = applyPlugins({
      Schema: class Schema {},
      options: {},
    }, [
      pluginString,
      pluginHash,
    ]);
    pluginHash.mixin(compiler.Schema);
    testContext.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({}, new compiler.Schema.Hash({ value: schemaDef }), schemaOptions).validate;
  });

  describe('Given an hash schema', () => {
    beforeEach(() => {
      testContext.validate1 = testContext.createValidate(String);
    });
    test('should return error if not an hash', () => {
      expect(testContext.validate1([])).toEqual({
        error: ERROR_NOT_OBJECT,
        actual: [],
      });
    });
    test('should accept hash of strings', () => {
      expect(testContext.validate1({
        a: 'a',
        b: 'b',
        c: 'c',
      })).toBeFalsy();
    });
    test('should reject hash of numbers', () => {
      expect(testContext.validate1({
        a: 1,
        b: 2,
      })).toEqual({
        errors: {
          a: {
            error: ERROR_NOT_STRING,
            actual: 1,
          },
          b: {
            error: ERROR_NOT_STRING,
            actual: 2,
          },
        },
      });
    });
  });
});
