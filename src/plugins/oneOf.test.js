/* eslint-env jest */
import {
  ERROR_NO_ALTERNATIVE,
} from '../constants.js';
import pluginOneOf from './oneOf.js';
import {
  combine,
} from '../utils.js';
import {
  validateIsNumber,
  validateIsString,
} from '../validators.js';
import { applyPlugins } from '../createCompiler.js';

const pluginNumber = {
  compile: () => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef === Number) {
      return next({
        ...validator,
        typeName: 'number',
        validate: combine([
          validator.validate,
          validateIsNumber,
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
};
const pluginString = {
  compile: () => next => (validator, schemaDef, schemaOptions) => {
    if (schemaDef === String) {
      return next({
        ...validator,
        typeName: 'string',
        validate: combine([
          validator.validate,
          validateIsString,
        ]),
      }, schemaDef, schemaOptions);
    }
    return next(validator, schemaDef, schemaOptions);
  },
};

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
      pluginNumber,
      pluginString,
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
