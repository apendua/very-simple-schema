/* eslint-env jest */
import {
  ERROR_VALUE_NOT_ALLOWED,
} from '../constants.js';
import { applyPlugins } from '../createCompiler.js';
import pluginAllowedValues from './allowedValues.js';

const compiler = applyPlugins({
  Validator(props) {
    Object.assign(this, props);
  },
}, [
  pluginAllowedValues,
]);

describe('Test allowedValues plugin', () => {
  let testContext;

  beforeEach(() => {
    testContext = {};
  });

  beforeEach(() => {
    testContext.Schema = function () {};
    testContext.createValidate =
      (schemaDef, schemaOptions = {}) =>
        compiler.compile({ isAtomic: true }, schemaDef, schemaOptions).validate;
  });

  describe('Given a schema with allowedValues', () => {
    describe('and the schema is atomic', () => {
      beforeEach(() => {
        testContext.validate1 = testContext.createValidate(Number, { allowedValues: [1, 2] });
      });
      test('should reject value that is not allowed', () => {
        expect(testContext.validate1(3)).toEqual({
          error: ERROR_VALUE_NOT_ALLOWED,
          expected: [1, 2],
          actual: 3,
        });
      });
      test('should accept value that is allowed', () => {
        expect(testContext.validate1(1)).toBeFalsy();
      });
    });
  });
});
